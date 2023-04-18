/* eslint-env jest */

import type { InvolvedFilter } from '../../../tsTypes';

import getFilterFromInvolvedFilters from './index';

type InvolvedFilters = {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
};

describe('getFilterFromInvolvedFilters', () => {
  test('inputOutputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: null };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: null, outputEntity: [[], 5] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, outputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: [[], 5], outputEntity: null };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = []', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[]] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = [], 5', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[], 5] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [], limit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [], outputEntity = [{ x: "abc" }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[], 5],
      outputEntity: [[{ x: 'abc' }]],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [{ x: 'abc' }] };

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }], outputEntity = []', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[{ x: 'abc' }]],
      outputEntity: [[], 5],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [{ x: 'abc' }], limit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }], outputEntity = [{ y: "xyz" }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[{ x: 'abc' }], 3],
      outputEntity: [[{ y: 'xyz' }], 5],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [{ AND: [{ x: 'abc' }, { y: 'xyz' }] }], limit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputEntity = [{ x: "abc" }, { t: 1 }], outputEntity = [{ y: "xyz" }, { k: 2 }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[{ x: 'abc' }, { t: 1 }], 5],
      outputEntity: [[{ y: 'xyz' }, { k: 2 }]],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = {
      filter: [{ AND: [{ OR: [{ x: 'abc' }, { t: 1 }] }, { OR: [{ y: 'xyz' }, { k: 2 }] }] }],
    };

    expect(result).toEqual(expectedResult);
  });
});
