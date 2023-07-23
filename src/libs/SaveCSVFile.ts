import xlsx from 'xlsx';
import fs from 'fs';

export default function saveCsvFile(fileName: string, records: object[]) {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(records);
  xlsx.utils.book_append_sheet(workbook, worksheet);

  const csv = xlsx.utils.sheet_to_csv(worksheet);
  fs.writeFileSync(fileName, csv);
}
