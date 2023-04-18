/* eslint-env jest */

import type { InvolvedFilter } from '../../../../tsTypes';

import modifyConnectionArgsAndInvolvedFilters from './index';

type InvolvedFilters = {
  [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
};

describe('modifyConnectionArgsAndInvolvedFilters util', () => {
  const name = 'Example';

  test('get results for { first: 6 }', () => {
    const args = { first: 6 };
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[], 3] };

    const expectedResult = [{ first: 3 }, { inputOutputEntity: [[]] }];

    const result = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters, name);

    expect(result).toEqual(expectedResult);

    const involvedFilters2: InvolvedFilters = { inputOutputEntity: [[]] };

    const expectedResult2 = [args, involvedFilters2];

    const result2 = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters2, name);

    expect(result2).toEqual(expectedResult2);
  });

  test('get results for { first: 5, after: "someCursor" }', () => {
    const args = { first: 5, after: 'someCursor' };
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[], 3] };

    const expectedResult = [{ first: 3, after: 'someCursor' }, { inputOutputEntity: [[]] }];

    const result = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters, name);

    expect(result).toEqual(expectedResult);

    const involvedFilters2: InvolvedFilters = { inputOutputEntity: [[]] };

    const expectedResult2 = [args, involvedFilters2];

    const result2 = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters2, name);

    expect(result2).toEqual(expectedResult2);
  });

  test('get results for { last: 5, before: "someCursor" }', () => {
    const args = { last: 5, before: 'someCursor' };
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[], 3] };

    const expectedResult = [{ last: 3, before: 'someCursor' }, { inputOutputEntity: [[]] }];

    const result = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters, name);

    expect(result).toEqual(expectedResult);

    const involvedFilters2: InvolvedFilters = { inputOutputEntity: [[]] };

    const expectedResult2 = [args, involvedFilters2];

    const result2 = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters2, name);

    expect(result2).toEqual(expectedResult2);
  });

  test('get results for { first: 6 }', () => {
    const args = { last: 4 };
    const involvedFilters: InvolvedFilters = { inputOutputEntity: [[], 3] };

    const expectedResult = [{ last: 3 }, { inputOutputEntity: [[]] }];

    const result = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters, name);

    expect(result).toEqual(expectedResult);

    const involvedFilters2: InvolvedFilters = { inputOutputEntity: [[]] };

    const expectedResult2 = [args, involvedFilters2];

    const result2 = modifyConnectionArgsAndInvolvedFilters(args, involvedFilters2, name);

    expect(result2).toEqual(expectedResult2);
  });
});
