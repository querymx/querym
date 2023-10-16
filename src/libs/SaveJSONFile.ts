import fs from 'fs';

export default function saveJsonFile(fileName: string, records: object[]) {
  const jsonString = JSON.stringify(records);
  fs.writeFileSync(fileName, jsonString);
}
