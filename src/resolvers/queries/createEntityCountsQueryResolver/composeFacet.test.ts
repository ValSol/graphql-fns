import composeFacet from './composeFacet';

describe('composeFacet', () => {
  test('simple', () => {
    const whereArr = [{ weight_gt: 4 }, { weight_lt: 4 }, {}];
    const result = composeFacet(whereArr);

    const expetedResult = {
      $facet: {
        '0': [{ $match: { weight_gt: 4 } }, { $count: 'count' }],
        '1': [{ $match: { weight_lt: 4 } }, { $count: 'count' }],
        '2': [{ $count: 'count' }],
      },
    };

    expect(result).toEqual(expetedResult);
  });

  test('should not add "$match" for undefined where', () => {
    const whereArr = [undefined as unknown as Record<string, any>, { weight: { $eq: 4 } }];
    const result = composeFacet(whereArr);

    const expetedResult = {
      $facet: {
        '0': [{ $count: 'count' }],
        '1': [{ $match: { weight: { $eq: 4 } } }, { $count: 'count' }],
      },
    };

    expect(result).toEqual(expetedResult);
  });
});
