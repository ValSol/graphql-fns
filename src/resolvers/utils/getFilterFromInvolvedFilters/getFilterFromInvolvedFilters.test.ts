/* eslint-env jest */

import type { InvolvedFilter } from '../../../tsTypes';

import getFilterFromInvolvedFilters from '.';

type InvolvedFilters = {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
};

describe('getFilterFromInvolvedFilters', () => {
  test('inputOutputFilterAndLimit = null', () => {
    const involvedFilters: InvolvedFilters = { inputOutputFilterAndLimit: null };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, inputFilterAndLimit = null', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: null,
      outputFilterAndLimit: [[], 5],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, outputFilterAndLimit = null', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[], 5],
      outputFilterAndLimit: null,
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = []', () => {
    const involvedFilters: InvolvedFilters = { inputOutputFilterAndLimit: [[]] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = [], 5', () => {
    const involvedFilters: InvolvedFilters = { inputOutputFilterAndLimit: [[], 5] };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [], limit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputFilterAndLimit = [], outputFilterAndLimit = [{ x: "abc" }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[], 5],
      outputFilterAndLimit: [[{ x: 'abc' }]],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [{ x: 'abc' }] };

    expect(result).toEqual(expectedResult);
  });

  test('inputFilterAndLimit = [{ x: "abc" }], outputFilterAndLimit = []', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[{ x: 'abc' }]],
      outputFilterAndLimit: [[], 5],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [{ x: 'abc' }], limit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputFilterAndLimit = [{ x: "abc" }], outputFilterAndLimit = [{ y: "xyz" }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[{ x: 'abc' }], 3],
      outputFilterAndLimit: [[{ y: 'xyz' }], 5],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = { filter: [{ AND: [{ x: 'abc' }, { y: 'xyz' }] }], limit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputFilterAndLimit = [{ x: "abc" }, { t: 1 }], outputFilterAndLimit = [{ y: "xyz" }, { k: 2 }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[{ x: 'abc' }, { t: 1 }], 5],
      outputFilterAndLimit: [[{ y: 'xyz' }, { k: 2 }]],
    };

    const result = getFilterFromInvolvedFilters(involvedFilters);

    const expectedResult = {
      filter: [{ AND: [{ OR: [{ x: 'abc' }, { t: 1 }] }, { OR: [{ y: 'xyz' }, { k: 2 }] }] }],
    };

    expect(result).toEqual(expectedResult);
  });
});
