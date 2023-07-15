import { parseEnumType } from './ParseColumnType';

test('Parse enum column type', () => {
  expect(
    parseEnumType(
      `enum('CONTAINS SQL','NO SQL','READS SQL DATA','MODIFIES SQL DATA')`
    )
  ).toEqual(['CONTAINS SQL', 'NO SQL', 'READS SQL DATA', 'MODIFIES SQL DATA']);
});
