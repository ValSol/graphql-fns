/* eslint-env jest */

import type { InvolvedFilter } from '../../../tsTypes';
import getInputAndOutputFilters from '.';

type InvolvedFilters = {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
};

describe('getInputAndOutputFilters', () => {
  test('inputOutputFilterAndLimit = null', () => {
    const involvedFilters = { inputOutputFilterAndLimit: null };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult: InvolvedFilters = { inputFilter: null, outputFilter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, inputFilterAndLimit = null, outputFilterAndLimit = []', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: null,
      outputFilterAndLimit: [[]],
    };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: null, outputFilter: [] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, inputFilterAndLimit = null, outputFilterAndLimit = []', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: null,
      outputFilterAndLimit: [[], 5],
    };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: null, outputFilter: [], outputLimit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, inputFilterAndLimit = [], outputFilterAndLimit = null', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[]],
      outputFilterAndLimit: null,
    };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, inputFilterAndLimit = [], outputFilterAndLimit = null', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[], 5],
      outputFilterAndLimit: null,
    };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: null, inputLimit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, inputFilterAndLimit = [{ a: 1 }], outputFilterAndLimit = [{ b: 2 }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[{ a: 1 }]],
      outputFilterAndLimit: [[{ b: 2 }]],
    };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [{ a: 1 }], outputFilter: [{ b: 2 }] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = undefined, inputFilterAndLimit = [{ a: 1 }, 5], outputFilterAndLimit = [{ b: 2 }, 50]', () => {
    const involvedFilters: InvolvedFilters = {
      inputFilterAndLimit: [[{ a: 1 }], 5],
      outputFilterAndLimit: [[{ b: 2 }], 50],
    };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = {
      inputFilter: [{ a: 1 }],
      outputFilter: [{ b: 2 }],
      inputLimit: 5,
      outputLimit: 50,
    };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = []', () => {
    const involvedFilters: InvolvedFilters = { inputOutputFilterAndLimit: [[]] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: [] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputFilterAndLimit = [[], 5]', () => {
    const involvedFilters: InvolvedFilters = { inputOutputFilterAndLimit: [[], 5] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: [], inputLimit: 5, outputLimit: 5 };

    expect(result).toEqual(expectedResult);
  });
});
