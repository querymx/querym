export default function generateIncrementalName(
  nameList: string[],
  name: string
) {
  const finalName = name.replace(/ \(\d+\)$/g, '');

  for (let i = 0; i < 1000; i++) {
    const newName = i > 0 ? `${finalName} (${i})` : finalName;
    if (!nameList.find((prevName) => prevName === newName)) return newName;
  }

  return '';
}
