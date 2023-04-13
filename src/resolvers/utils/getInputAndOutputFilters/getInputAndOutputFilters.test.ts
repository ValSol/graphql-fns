/* eslint-env jest */

import type { InvolvedFilter } from '../../../tsTypes';
import getInputAndOutputFilters from './index';

type InvolvedFilters = {
  [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
};

describe('getInputAndOutputFilters', () => {
  test('inputOutputEntity = null', () => {
    const involvedFilters = { inputOutputEntity: null };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult: InvolvedFilters = { inputFilter: null, outputFilter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = null, outputEntity = []', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: null, outputEntity: [[]] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: null, outputFilter: [] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = [], outputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: [[]], outputEntity: null };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = [{ a: 1 }], outputEntity = [{ b: 2 }]', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[{ a: 1 }]],
      outputEntity: [[{ b: 2 }]],
    };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [{ a: 1 }], outputFilter: [{ b: 2 }] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = []', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[]] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: [] };

    expect(result).toEqual(expectedResult);
  });
});
