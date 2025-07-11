import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { S3Service } from 'src/common/s3/s3.service';
import { DocuSignService } from './docusign.service';
import { ContractStatus } from '../enums/contract-status.enum';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';

@Injectable()
export class DocusignWebhookService {
  private readonly logger = new Logger(DocusignWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly docusignService: DocuSignService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async processEnvelopeEvent(payload: any): Promise<void> {
    const envelopeId = payload?.data?.envelopeId;
    const status = payload?.event;
    const voidedReason = payload?.data?.voidedReason;

    this.logger.log(
      `Réception du webhook DocuSign: status=${status}, envelopeId=${envelopeId}`,
    );

    if (!envelopeId || !status) return;

    const contract = await this.prisma.contract.findFirst({
      where: { docusignEnvelopeId: envelopeId },
    });

    if (!contract) {
      this.logger.warn(`Aucun contrat trouvé pour l'envelopeId ${envelopeId}`);
      return;
    }

    switch (status) {
      case 'envelope-completed':
      case 'completed': {
        const signedPdf =
          await this.docusignService.downloadSignedPdf(envelopeId);

        const previewBuffer =
          await this.pdfGeneratorService.generatePreviewFromPdf(signedPdf);

        await this.s3Service.uploadFile(
          signedPdf,
          contract.pdfKey,
          'application/pdf',
        );

        await this.s3Service.uploadFile(
          previewBuffer,
          contract.previewKey,
          'image/png',
        );

        await this.prisma.contract.update({
          where: { id: contract.id },
          data: {
            status: ContractStatus.signed,
          },
        });

        this.logger.log(`Contrat ${contract.id} signé et mis à jour.`);
        break;
      }

      case 'envelope-declined':
        await this.prisma.contract.update({
          where: { id: contract.id },
          data: {
            status: ContractStatus.declined,
          },
        });
        this.logger.log(`Contrat ${contract.id} refusé.`);
        break;

      case 'envelope-voided':
        if (voidedReason?.toLowerCase()?.includes('cancelled by sender')) {
          await this.prisma.contract.update({
            where: { id: contract.id },
            data: {
              status: ContractStatus.cancelled,
            },
          });

          this.logger.log(`Contrat ${contract.id} annulé par le freelance.`);
        } else {
          await this.prisma.contract.update({
            where: { id: contract.id },
            data: {
              status: ContractStatus.expired,
            },
          });
          this.logger.log(`Contrat ${contract.id} expiré.`);
        }
        break;

      default:
        this.logger.warn(`Statut DocuSign non géré : ${status}`);
        break;
    }
  }
}
