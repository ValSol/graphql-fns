import type { GeneralConfig, TangibleEntityConfig } from '../../../../tsTypes';

import getTransformerAndConfig from './getTransformerAndConfig';
import transformData from './transformData';
import transformWhere from './transformWhere';

describe('getTransformerAndConfig', () => {
  const personConfig = {} as TangibleEntityConfig;
  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    relationalFields: [
      {
        name: 'friend',
        oppositeName: 'fellows',
        config: personConfig,
        index: true,
        type: 'relationalFields',
      },
      {
        name: 'fellows',
        oppositeName: 'friend',
        config: personConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
  });

  const generalConfig: GeneralConfig = { allEntityConfigs: { Person: personConfig } };

  test('should return transformer for where input', () => {
    const result = getTransformerAndConfig('PersonWhereInput', generalConfig);

    expect(result).toEqual([transformWhere, personConfig]);
  });

  test('should return transformer for list of restricted where inputs', () => {
    const result = getTransformerAndConfig('[PersonRestrictedWhereInput!]!', generalConfig);

    expect(result).toEqual([transformWhere, personConfig]);
  });

  test('should return transformer for create input', () => {
    const result = getTransformerAndConfig('PersonCreateInput', generalConfig);

    expect(result).toEqual([transformData, null]);
  });

  test('should return null for scalar', () => {
    const result = getTransformerAndConfig('String', generalConfig);

    expect(result).toBeNull();
  });
});
