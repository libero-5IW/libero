export function ensurePdfWrapper(html: string, logoUrl: string): string {
  const style = `
    .pdf-wrapper {
      font-family: 'Roboto Condensed', 'Roboto', 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
      color: #212121;
      font-size: 13px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      padding: 24px 16px;
      margin: 0;
      max-width: 100%;
      box-sizing: border-box;
    }
    .pdf-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #3F51B5;
      padding-bottom: 12px;
      margin-bottom: 32px;
    }
    .pdf-logo {
      max-width: 120px;
      height: auto;
    }
    .pdf-title {
      font-size: 2.2em;
      color: #3F51B5;
      font-weight: bold;
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
      border: 1px solid #bbb;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #E8EAF6;
      color: #3F51B5;
    }
    tr:nth-child(even) {
      background: #fafbfc;
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

  const header = `<div class="pdf-header"><img src="${logoUrl}" class="pdf-logo" /></div>`;
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