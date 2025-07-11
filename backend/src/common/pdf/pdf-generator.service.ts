import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfGeneratorService {
  async generatePdfAndPreview(
    html: string,
  ): Promise<{ pdfBuffer: Buffer; previewBuffer: Buffer }> {
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    const screenshotUint8Array = await page.screenshot({
      type: 'png',
      fullPage: true,
    });

    await browser.close();

    return {
      pdfBuffer: Buffer.from(pdfUint8Array),
      previewBuffer: Buffer.from(screenshotUint8Array as Uint8Array),
    };
  }

  async generateFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }
}
