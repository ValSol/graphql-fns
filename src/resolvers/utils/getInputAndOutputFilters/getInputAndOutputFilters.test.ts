/* eslint-env jest */

import type { InvolvedFilter } from '../../../tsTypes';
import getInputAndOutputFilters from './index';

type InvolvedFilters = {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
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

  test('inputOutputEntity = undefined, inputEntity = null, outputEntity = []', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: null, outputEntity: [[], 5] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: null, outputFilter: [], outputLimit: 5 };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = [], outputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: [[]], outputEntity: null };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = [], outputEntity = null', () => {
    const involvedFilters: InvolvedFilters = { inputEntity: [[], 5], outputEntity: null };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: null, inputLimit: 5 };

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

  test('inputOutputEntity = undefined, inputEntity = [{ a: 1 }, 5], outputEntity = [{ b: 2 }, 50]', () => {
    const involvedFilters: InvolvedFilters = {
      inputEntity: [[{ a: 1 }], 5],
      outputEntity: [[{ b: 2 }], 50],
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

  test('inputOutputEntity = []', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[]] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: [] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = [[], 5]', () => {
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[], 5] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: [], inputLimit: 5, outputLimit: 5 };

    expect(result).toEqual(expectedResult);
  });
});
