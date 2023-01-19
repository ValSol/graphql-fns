// @flow
/* eslint-env jest */

import getFilterFromInvolvedFilters from './index';

describe('getFilterFromInvolvedFilters', () => {
  test('inputOutputEntity = null', () => {
    const involvedFilters = { inputOutputEntity: null };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = null', () => {
    const involvedFilters = { inputEntity: null, outputEntity: [] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  test('inputOutputEntity = undefined, outputEntity = null', () => {
    const involvedFilters = { inputEntity: [], outputEntity: null };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  test('inputOutputEntity = []', () => {
    const involvedFilters = { inputOutputEntity: [] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [], outputEntity = [{ x: "abc" }]', () => {
    const involvedFilters = { inputEntity: [], outputEntity: [{ x: 'abc' }] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [{ x: 'abc' }];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }], outputEntity = []', () => {
    const involvedFilters = { inputEntity: [{ x: 'abc' }], outputEntity: [] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [{ x: 'abc' }];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }], outputEntity = [{ y: "xyz" }]', () => {
    const involvedFilters = { inputEntity: [{ x: 'abc' }], outputEntity: [{ y: 'xyz' }] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [{ AND: [{ x: 'abc' }, { y: 'xyz' }] }];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }, { t: 1 }], outputEntity = [{ y: "xyz" }, { k: 2 }]', () => {
    const involvedFilters = {
      inputEntity: [{ x: 'abc' }, { t: 1 }],
      outputEntity: [{ y: 'xyz' }, { k: 2 }],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [
      { AND: [{ OR: [{ x: 'abc' }, { t: 1 }] }, { OR: [{ y: 'xyz' }, { k: 2 }] }] },
    ];

    expect(result).toEqual(expectedResult);
  });
});
