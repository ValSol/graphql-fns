// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import getTangibleEntities from './getTangibleEntities';

describe('getTangibleEntities util', () => {
  const configA: EntityConfig = {
    name: 'A',
    type: 'tangible',
    textFields: [{ name: 'text' }],
  };

  const configB: EntityConfig = {
    name: 'B',
    type: 'tangible',
    textFields: [{ name: 'text' }],
  };

  const configVirtualA: EntityConfig = {
    name: 'VirtualA',
    type: 'virtual',
    childFields: [{ name: 'a', config: configA }],
  };

  const configVirtualB: EntityConfig = {
    name: 'VirtualB',
    type: 'virtual',
    childFields: [{ name: 'bs', config: configB }],
  };

  const configVirtualC: EntityConfig = {
    name: 'VirtualC',
    type: 'virtual',
    childFields: [
      { name: 'a', config: configVirtualA },
      { name: 'b', config: configVirtualB },
    ],
  };

  test('should return opposite fields for placeConfig', () => {
    const result = getTangibleEntities(configA);

    const expectedResult = ['A'];

    expect(result).toEqual(expectedResult);
  });

  test('should return opposite fields for placeConfig', () => {
    const result = getTangibleEntities(configVirtualC);

    const expectedResult = ['A', 'B'];

    expect(result).toEqual(expectedResult);
  });
});
