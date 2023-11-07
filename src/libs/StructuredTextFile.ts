import fs from 'fs';

export type SupportedStructuredFileType = 'json'

function jsonSerializer(data: any) {
  return JSON.stringify(data, undefined, 2);
}

export default function saveStructuredTextFile(
  fileName: string,
  type: SupportedStructuredFileType,
  records: object[]
) {

  const serializers = {
    json: jsonSerializer,
  }

  fs.writeFileSync(fileName, serializers[type](records))
}
