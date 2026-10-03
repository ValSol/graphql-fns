import composeDistinctValuesStages from './composeDistinctValuesStages';

describe('composeDistinctValuesStages', () => {
  test('should unwind and group a top level field (array or scalar)', () => {
    const result = composeDistinctValuesStages('kinds');

    const expectedResult = [
      { $unwind: '$kinds' },
      { $group: { _id: '$kinds' } },
      { $sort: { _id: 1 } },
    ];

    expect(result).toEqual(expectedResult);
  });

  test('should project an embedded path and unwind it for every segment', () => {
    const result = composeDistinctValuesStages('names.text');

    const expectedResult = [
      { $project: { _id: 0, value: '$names.text' } },
      { $unwind: '$value' },
      { $unwind: '$value' },
      { $group: { _id: '$value' } },
      { $sort: { _id: 1 } },
    ];

    expect(result).toEqual(expectedResult);
  });
});
