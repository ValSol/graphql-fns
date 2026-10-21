import parseSortKey from '.';

describe('parseSortKey', () => {
  test('should parse sort keys', () => {
    expect(parseSortKey('label_ASC')).toEqual(['label', 1]);
    expect(parseSortKey('id_DESC')).toEqual(['_id', -1]);
  });

  test('should throw an error for an incorrect sort key', () => {
    ['label', 'label_UP', '_ASC'].forEach((sortKey) =>
      expect(() => parseSortKey(sortKey)).toThrow(TypeError),
    );
  });
});
