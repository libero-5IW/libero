import { format } from 'date-fns';
import * as stringify from 'csv-stringify/sync';
import slugify from 'slugify';

interface ExportRow {
  [key: string]: any;
}

interface ExportCSVOptions {
  rows: ExportRow[];
  columns: Record<string, string>;
  filenamePrefix: string;
  firstRowLabel?: string;
}

export function generateCSVExport({
  rows,
  columns,
  filenamePrefix,
  firstRowLabel = 'inconnu',
}: ExportCSVOptions): { filename: string; content: string } {
  const content = stringify.stringify(rows, {
    header: true,
    columns,
  });

  const slug = rows[0]
    ? slugify(Object.values(rows[0])[0]?.toString() || firstRowLabel, {
        lower: true,
      })
    : firstRowLabel;

  const filename = `${filenamePrefix}_${slug}_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  return { filename, content };
}
