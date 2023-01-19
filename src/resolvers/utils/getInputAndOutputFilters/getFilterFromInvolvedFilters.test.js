// @flow
/* eslint-env jest */

import getInputAndOutputFilters from './index';

describe('getInputAndOutputFilters', () => {
  test('inputOutputEntity = null', () => {
    const involvedFilters = { inputOutputEntity: null };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: null, outputFilter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = null, outputEntity = []', () => {
    const involvedFilters = { inputEntity: null, outputEntity: [] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: null, outputFilter: [] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = [], outputEntity = null', () => {
    const involvedFilters = { inputEntity: [], outputEntity: null };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: null };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = undefined, inputEntity = [{ a: 1 }], outputEntity = [{ b: 2 }]', () => {
    const involvedFilters = { inputEntity: [{ a: 1 }], outputEntity: [{ b: 2 }] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [{ a: 1 }], outputFilter: [{ b: 2 }] };

    expect(result).toEqual(expectedResult);
  });

  test('inputOutputEntity = []', () => {
    const involvedFilters = { inputOutputEntity: [] };

    const result = getInputAndOutputFilters(involvedFilters);

    const expectedResult = { inputFilter: [], outputFilter: [] };

    expect(result).toEqual(expectedResult);
  });
});
