/* eslint-env jest */

import type { InvolvedFilter } from '../../../tsTypes';

import getFilterFromInvolvedFilters from './index';

type InvolvedFilters = {
  [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
};

describe('getFilterFromInvolvedFilters', () => {
  test('inputOutputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: null };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: null, outputEntity: [[]] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  test('inputOutputEntity = undefined, outputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: [[]], outputEntity: null };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = null;

    expect(result).toBe(expectedResult);
  });

  test('inputOutputEntity = []', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[]] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult: Array<any> = [];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [], outputEntity = [{ x: "abc" }]', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: [[]], outputEntity: [[{ x: 'abc' }]] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [{ x: 'abc' }];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }], outputEntity = []', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: [[{ x: 'abc' }]], outputEntity: [[]] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [{ x: 'abc' }];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }], outputEntity = [{ y: "xyz" }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[{ x: 'abc' }]],
      outputEntity: [[{ y: 'xyz' }]],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [{ AND: [{ x: 'abc' }, { y: 'xyz' }] }];

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }, { t: 1 }], outputEntity = [{ y: "xyz" }, { k: 2 }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[{ x: 'abc' }, { t: 1 }]],
      outputEntity: [[{ y: 'xyz' }, { k: 2 }]],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = [
      { AND: [{ OR: [{ x: 'abc' }, { t: 1 }] }, { OR: [{ y: 'xyz' }, { k: 2 }] }] },
    ];

    expect(result).toEqual(expectedResult);
  });
});
