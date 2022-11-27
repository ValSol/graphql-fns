// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import pushIntoEntityMutationAttributes from '../../types/actionAttributes/pushIntoEntityMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composePushIntoEntityMutationArgs', () => {
  test('should compose pushIntoEntity mutation args ', () => {
    const prefixName = 'Home';
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
          array: true,
        },
      ],
    };

    const expectedResult = [
      'mutation Home_pushIntoExample($whereOne: ExampleWhereOneInput!, $data: PushIntoExampleInput!, $positions: ExamplePushPositionsInput) {',
      '  pushIntoExample(whereOne: $whereOne, data: $data, positions: $positions) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      pushIntoEntityMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
