import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;
  private env: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.bucket = configService.get('AWS_BUCKET_NAME');
    this.env = process.env.NODE_ENV || 'development';
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3.send(command);
  }

  async uploadDocumentAssets(
    pdfBuffer: Buffer,
    imageBuffer: Buffer,
    userEmail: string,
    documentType:
      | 'quotes'
      | 'contracts'
      | 'invoices'
      | 'quote-templates'
      | 'contract-templates'
      | 'invoice-templates',
  ): Promise<{ pdfKey: string; previewKey: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `${this.env}/${userEmail}/${documentType}`;

    const pdfKey = `${baseName}/pdf/${timestamp}.pdf`;
    const previewKey = `${baseName}/preview/${timestamp}.preview.png`;

    await this.uploadFile(pdfBuffer, pdfKey, 'application/pdf');
    await this.uploadFile(imageBuffer, previewKey, 'image/png');

    return { pdfKey, previewKey };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(command);
  }

  async generateSignedUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    });
  }
}
