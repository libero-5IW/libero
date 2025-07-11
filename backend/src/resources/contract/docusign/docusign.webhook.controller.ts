import { Controller, Post, Headers, Body, HttpCode } from '@nestjs/common';
import { DocusignWebhookService } from './docusign.webhook.service';
import { Public } from 'src/resources/auth/decorators/public.decorator';

@Controller('webhooks/docusign')
@Public()
export class DocusignWebhookController {
  constructor(private readonly webhookService: DocusignWebhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Headers() headers: Record<string, string>,
    @Body() body: any,
  ) {
    console.log('Webhook reçu de DocuSign');
    console.log('BODY:', JSON.stringify(body, null, 2));
    console.dir(body, { depth: null });

    await this.webhookService.processEnvelopeEvent(body);
    return { status: 'ok' };
  }
}
