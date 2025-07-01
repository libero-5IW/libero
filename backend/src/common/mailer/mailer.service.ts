import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

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
      subject: 'Réinitialisation de votre mot de passe',
      template: 'reset-password',
      context: {
        resetLink,
        helpUrl: `${process.env.FRONTEND_URL}/help`,
        year: new Date().getFullYear(),
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

  async sendAccountBlockedEmail(
    email: string,
    resetLink: string,
    lockDuration: number,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Compte bloqué - Libero',
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

  private getLogoAttachment() {
    return {
      filename: 'logo.png',
      path: join(__dirname, 'assets/logo.png'),
      cid: 'logo',
    };
  }
}
