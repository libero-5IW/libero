export function ensurePdfWrapper(html: string, docTitle: string): string {
  const style = `
    .pdf-wrapper {
      font-family: 'Roboto', Arial, sans-serif;
      color: #212121;
      font-size: 13px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      padding: 32px 24px;
      margin: 0;
      max-width: 800px;
      box-sizing: border-box;
    }
    .pdf-header {
      border-bottom: 2px solid #3F51B5;
      padding-bottom: 18px;
      margin-bottom: 36px;
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
    }
    .pdf-title {
      font-size: 2.2em;
      color: #3F51B5;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: #3F51B5;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    p {
      margin: 0.7em 0;
      line-height: 1.7;
    }
    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 2em 0;
    }
    ul, ol {
      margin: 0.7em 0 0.7em 2em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.98em;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background: #f0f4ff;
      color: #3F51B5;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .section-card {
      background: #f7fafd;
      border-left: 4px solid #3F51B5;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
  `;

  const header = `<div class="pdf-header"><span class="pdf-title">${docTitle}</span></div>`;
  const bodyHtml = html.trim().startsWith('<div class="pdf-wrapper"')
    ? html.replace('<div class="pdf-wrapper">', `<div class="pdf-wrapper">${header}`)
    : `<div class="pdf-wrapper">${header}${html}</div>`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>${style}</style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`;
} 