import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

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

  async generatePreviewFromPdf(pdfBuffer: Buffer): Promise<Buffer> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-preview-'));
    const tmpPdfPath = path.join(tmpDir, 'doc.pdf');
    await fs.writeFile(tmpPdfPath, pdfBuffer);

    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(`file://${tmpPdfPath}`, { waitUntil: 'networkidle0' });

    const screenshotBuffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    });

    await browser.close();
    await fs.rm(tmpDir, { recursive: true, force: true });

    return Buffer.from(screenshotBuffer as Uint8Array);
  }
}
