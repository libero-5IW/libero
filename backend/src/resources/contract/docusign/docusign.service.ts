import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as docusign from 'docusign-esign';

@Injectable()
export class DocuSignService {
  private apiClient: docusign.ApiClient;
  private readonly integratorKey: string;
  private readonly userId: string;
  private readonly accountId: string;
  private readonly baseUrl: string;
  private readonly privateKey: string;

  constructor(private configService: ConfigService) {
    this.integratorKey = this.configService.get<string>(
      'DOCUSIGN_INTEGRATION_KEY',
    );
    this.userId = this.configService.get<string>('DOCUSIGN_USER_ID');
    this.accountId = this.configService.get<string>('DOCUSIGN_ACCOUNT_ID');
    this.baseUrl = this.configService.get<string>('DOCUSIGN_BASE_URL');
    this.privateKey = this.configService.get<string>('DOCUSIGN_PRIVATE_KEY');

    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(this.baseUrl);
  }

  async authenticate(): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      this.apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
      this.apiClient.setBasePath(this.baseUrl);
    } catch (error) {
      console.error('Erreur lors de l’authentification JWT DocuSign:', error);
      throw new InternalServerErrorException(
        'Impossible de s’authentifier auprès de DocuSign.',
      );
    }
  }

  async sendContractForSignature(
    pdfBuffer: Buffer,
    freelanceEmail: string,
    freelanceName: string,
    clientEmail: string,
    clientName: string,
  ): Promise<string> {
    await this.authenticate();

    const envelopesApi = new docusign.EnvelopesApi(this.apiClient);

    const documentBase64 = pdfBuffer.toString('base64');

    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Signature du contrat';
    envelopeDefinition.documents = [
      {
        documentBase64,
        name: 'Contrat de prestation',
        fileExtension: 'pdf',
        documentId: '1',
      },
    ];

    envelopeDefinition.recipients = {
      signers: [
        {
          email: freelanceEmail,
          name: freelanceName,
          recipientId: '1',
          routingOrder: '1',
          tabs: {
            signHereTabs: [
              {
                anchorString: '{{freelancer_signature}}',
                anchorYOffset: '0',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
              },
            ],
            fullNameTabs: [
              {
                anchorString: '{{freelancer_fullname_signed}}',
                anchorYOffset: '0',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
              },
            ],
            dateSignedTabs: [
              {
                anchorString: '{{freelancer_date_signed}}',
                anchorYOffset: '0',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
              },
            ],
          },
        },
        {
          email: clientEmail,
          name: clientName,
          recipientId: '2',
          routingOrder: '2',
          tabs: {
            signHereTabs: [
              {
                anchorString: '{{client_signature}}',
                anchorYOffset: '0',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
              },
            ],
            fullNameTabs: [
              {
                anchorString: '{{client_fullname_signed}}',
                anchorYOffset: '0',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
              },
            ],
            dateSignedTabs: [
              {
                anchorString: '{{client_date_signed}}',
                anchorYOffset: '0',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
              },
            ],
          },
        },
      ],
    };

    envelopeDefinition.status = 'sent';

    const envelope = await envelopesApi.createEnvelope(this.accountId, {
      envelopeDefinition,
    });

    return envelope.envelopeId;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const result = await this.apiClient.requestJWTUserToken(
        this.integratorKey,
        this.userId,
        'signature',
        Buffer.from(this.privateKey),
        3600,
      );

      return result.body.access_token;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération du token JWT DocuSign :',
        error,
      );
      throw new InternalServerErrorException(
        'Impossible de récupérer le token JWT de DocuSign.',
      );
    }
  }

  async downloadSignedPdf(envelopeId: string): Promise<Buffer> {
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(this.baseUrl);
    apiClient.addDefaultHeader(
      'Authorization',
      `Bearer ${await this.getAccessToken()}`,
    );

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const pdf = await envelopesApi.getDocument(
      this.accountId,
      envelopeId,
      '1',
      null,
    );

    return Buffer.from(pdf as Buffer);
  }
}
