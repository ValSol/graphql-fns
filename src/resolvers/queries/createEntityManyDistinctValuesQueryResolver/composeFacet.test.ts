import composeFacet from './composeFacet';

describe('composeFacet', () => {
  test('should compose a branch for every item', () => {
    const items = [
      { target: 'kinds', where: { serviceTier_gt: 1 } },
      { target: 'cuisine' },
      { target: 'names.text', where: {} },
    ];
    const result = composeFacet(items);

    const expetedResult = {
      $facet: {
        '0': [
          { $match: { serviceTier_gt: 1 } },
          { $unwind: '$kinds' },
          { $group: { _id: '$kinds' } },
          { $sort: { _id: 1 } },
        ],
        '1': [{ $unwind: '$cuisine' }, { $group: { _id: '$cuisine' } }, { $sort: { _id: 1 } }],
        '2': [
          { $project: { _id: 0, value: '$names.text' } },
          { $unwind: '$value' },
          { $unwind: '$value' },
          { $group: { _id: '$value' } },
          { $sort: { _id: 1 } },
        ],
      },
    };

    expect(result).toEqual(expetedResult);
  });

  test('should compose empty "$facet" for empty items', () => {
    const result = composeFacet([]);

    expect(result).toEqual({ $facet: {} });
  });
});
