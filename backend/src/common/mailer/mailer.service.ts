import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { UserEntity } from 'src/resources/user/entities/user.entity';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendWelcomeEmail(email: string, username: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue sur Libero !',
      template: 'welcome',
      context: {
        username,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendResetPasswordEmail(email: string, resetLink: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Libero',
      template: 'reset-password',
      context: {
        resetLink,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendAccountLockedEmail(
    email: string,
    resetLink: string,
    lockDuration: number,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Votre compte a été temporairement bloqué - Libero',
      template: 'account-blocked',
      context: {
        resetLink,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        year: new Date().getFullYear(),
        lockDuration,
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendPasswordResetSuccessEmail(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Mot de passe réinitialisé avec succès - Libero',
      template: 'password-reset-success',
      context: {
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendPasswordExpirationEmail(email: string, resetLink: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Votre mot de passe a expiré - Libero',
      template: 'password-expired',
      context: {
        resetLink,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        forgotPasswordUrl: `${process.env.FRONTEND_URL}/email-reset-password`,
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendPasswordUpdatedEmail(email: string, resetUrl: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Mot de passe modifié - Libero',
      template: 'password-updated',
      context: {
        resetUrl,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendAccountDeletedConfirmation(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirmation de suppression de compte - Libero',
      template: 'account-deleted',
      context: {
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendQuoteByEmail(
    email: string,
    clientName: string,
    freelance: UserEntity,
    quoteNumber: number,
    pdfBuffer: Buffer,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Devis - Libero`,
      template: 'quote-to-validate',
      context: {
        clientName,
        freelanceName:
          freelance.firstName + ' ' + freelance.lastName.toUpperCase(),
        freelanceEmail: freelance.email,
        freelanceCompany: freelance.companyName,
        year: new Date().getFullYear(),
        title: `Devis ${quoteNumber}`,
      },
      attachments: [
        this.getLogoAttachment(),
        {
          filename: `Devis_${quoteNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendInvoiceToPayEmail(
    email: string,
    clientName: string,
    freelance: UserEntity,
    invoiceNumber: number,
    pdfBuffer: Buffer,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Facture à régler - Libero`,
      template: 'invoice-to-pay',
      context: {
        clientName,
        freelanceName:
          freelance.firstName + ' ' + freelance.lastName.toUpperCase(),
        freelanceEmail: freelance.email,
        freelanceCompany: freelance.companyName,
        year: new Date().getFullYear(),
        title: `Facture ${invoiceNumber}`,
      },
      attachments: [
        this.getLogoAttachment(),
        {
          filename: `Facture_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendInvoicePaidEmail(
    email: string,
    clientName: string,
    freelance: UserEntity,
    invoiceNumber: number,
    pdfBuffer: Buffer,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Facture acquittée - Libero`,
      template: 'invoice-paid',
      context: {
        clientName,
        freelanceName: `${freelance.firstName} ${freelance.lastName.toUpperCase()}`,
        freelanceEmail: freelance.email,
        freelanceCompany: freelance.companyName,
        year: new Date().getFullYear(),
        title: `Facture ${invoiceNumber}`,
      },
      attachments: [
        this.getLogoAttachment(),
        {
          filename: `Facture_${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendReminderBeforeDue(
    clientEmail: string,
    clientName: string,
    freelance: UserEntity,
    invoiceNumber: number,
    dueDate: Date,
  ) {
    await this.mailerService.sendMail({
      to: clientEmail,
      subject: `Rappel - Facture bientôt échue - Libero`,
      template: 'invoice-reminder',
      context: {
        clientName: clientName,
        freelanceName: `${freelance.firstName} ${freelance.lastName.toUpperCase()}`,
        freelanceEmail: freelance.email,
        freelanceCompany: freelance.companyName,
        title: `Facture ${invoiceNumber}`,
        dueDate: dueDate.toLocaleDateString('fr-FR'),
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendLateInvoiceNotice(
    clientEmail: string,
    clientName: string,
    freelance: UserEntity,
    invoiceNumber: number,
    dueDate: Date,
  ) {
    await this.mailerService.sendMail({
      to: clientEmail,
      subject: `Retard de paiement - Facture échue - Libero`,
      template: 'invoice-late',
      context: {
        clientName: clientName,
        freelanceName: `${freelance.firstName} ${freelance.lastName.toUpperCase()}`,
        freelanceEmail: freelance.email,
        freelanceCompany: freelance.companyName,
        title: `Facture ${invoiceNumber}`,
        dueDate: dueDate.toLocaleDateString('fr-FR'),
        year: new Date().getFullYear(),
      },
      attachments: [this.getLogoAttachment()],
    });
  }

  async sendContractSignedEmail(
    email: string,
    clientName: string,
    freelance: UserEntity,
    contractNumber: number,
    pdfBuffer: Buffer,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Contrat signé - Libero`,
      template: 'contract-signed',
      context: {
        clientName,
        freelanceName: `${freelance.firstName} ${freelance.lastName.toUpperCase()}`,
        freelanceEmail: freelance.email,
        freelanceCompany: freelance.companyName,
        year: new Date().getFullYear(),
        title: `Contrat ${contractNumber}`,
      },
      attachments: [
        this.getLogoAttachment(),
        {
          filename: `Contrat_${contractNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  private getLogoAttachment() {
    return {
      filename: 'logo.png',
      path: join(__dirname, 'assets/logo.png'),
      cid: 'logo',
    };
  }
}
