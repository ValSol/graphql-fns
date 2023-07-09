/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import createEntityMutationAttributes from '../actionAttributes/createEntityMutationAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createCreateEntityMutationType', () => {
  test('should create mutation add entity type', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = '  createExample(data: ExampleCreateInput!, token: String): Example!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      createEntityMutationAttributes,
      entityTypeDic,
      inputDic,
    );

    expect(result).toEqual(expectedResult);
  });

  test('should create mutation add entity type', () => {
    const placeConfig: EntityConfig = {
      name: 'Place',
      type: 'tangible',
      textFields: [{ name: 'name', type: 'textFields' }],
    };
    const personConfig = {} as EntityConfig;
    Object.assign(personConfig, {
      name: 'Person',
      type: 'tangible',
      relationalFields: [
        {
          name: 'friends',
          config: personConfig,
          array: true,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'enemies',
          config: personConfig,
          array: true,
          type: 'relationalFields',
        },
        {
          name: 'location',
          config: placeConfig,
          required: true,
          type: 'relationalFields',
        },
        {
          name: 'favoritePlace',
          config: placeConfig,
          type: 'relationalFields',
        },
      ],
    });

    const generalConfig: GeneralConfig = {
      allEntityConfigs: { Place: placeConfig, Person: personConfig },
    };

    const expectedResult = '  createPerson(data: PersonCreateInput!, token: String): Person!';

    const entityTypeDic: { [entityName: string]: string } = {};

    const inputDic: { [inputName: string]: string } = {};

    const result = composeActionSignature(
      personConfig,
      generalConfig,
      createEntityMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
