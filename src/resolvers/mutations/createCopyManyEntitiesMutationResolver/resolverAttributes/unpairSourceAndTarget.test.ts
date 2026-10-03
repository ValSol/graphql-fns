import unpairSourceAndTarget from './unpairSourceAndTarget';

describe('unpairSourceAndTarget', () => {
  test('should return null for args of "copyX"', () => {
    expect(unpairSourceAndTarget({ whereKeyToSource: { original: { id: '1' } } })).toBeNull();
  });

  test('should split items into arrays matched by index', () => {
    expect(
      unpairSourceAndTarget({
        sourceAndTargetAndData: [
          { whereKeyToSource: { original: { id: '1' } }, whereTarget: { id: '3' } },
          {
            whereKeyToSource: { original: { id: '2' } },
            whereTarget: { id: '4' },
            data: { lastName: 'Boss' },
          },
        ],
      }),
    ).toEqual({
      whereKeyToSource: [{ original: { id: '1' } }, { original: { id: '2' } }],
      whereTarget: [{ id: '3' }, { id: '4' }],
      data: [{}, { lastName: 'Boss' }],
    });
  });

  test('should not return "whereTarget" if no item has it', () => {
    expect(
      unpairSourceAndTarget({ sourceAndTarget: [{ whereKeyToSource: { original: { id: '1' } } }] }),
    ).toEqual({ whereKeyToSource: [{ original: { id: '1' } }], data: [{}] });
  });

  test('should throw error if only some items have "whereTarget"', () => {
    expect(() =>
      unpairSourceAndTarget({
        sourceAndTarget: [
          { whereKeyToSource: { original: { id: '1' } }, whereTarget: { id: '3' } },
          { whereKeyToSource: { original: { id: '2' } } },
        ],
      }),
    ).toThrow('Expected "whereTarget" in every item or in none of them!');
  });
});
