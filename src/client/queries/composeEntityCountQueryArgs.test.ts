/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../tsTypes';

import entityCountQueryAttributes from '../../types/actionAttributes/entityCountQueryAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeEntityCountQueryArgs', () => {
  test('should compose entities query without indexed fields', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      `query Home_ExampleCount($where: ExampleWhereInput, $token: String) {
  ExampleCount(where: $where, token: $token)
}`,
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entityCountQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose entities query with ExampleWhereInput and ExampleSortInput args', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          index: true,
          type: 'textFields',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = [
      `query Home_ExampleCount($where: ExampleWhereInput, $token: String) {
  ExampleCount(where: $where, token: $token)
}`,
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      generalConfig,
      entityCountQueryAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
