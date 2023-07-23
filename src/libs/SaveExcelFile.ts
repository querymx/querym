import xlsx from 'xlsx';

export default function saveExcelFile(fileName: string, records: object[]) {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(records);
  xlsx.utils.book_append_sheet(workbook, worksheet);
  xlsx.writeFile(workbook, fileName);
}
