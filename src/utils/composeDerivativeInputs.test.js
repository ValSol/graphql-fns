// @flow
/* eslint-env jest */
import type { DerivativeInputs } from '../flowTypes';

import composeDerivativeInputs from './composeDerivativeInputs';

describe('composeDerivativeInputs', () => {
  test('compose simple thingConfigs', () => {
    const empty: DerivativeInputs = {
      suffix: '',
      allow: {
        Menu: ['thingWhereOneInput', 'thingUpdateInput'],
        MenuSection: ['thingWhereOneInput', 'thingUpdateInput'],
      },
    };

    const ForView: DerivativeInputs = {
      suffix: 'ForView',
      allow: {
        Restaurant: ['thingUpdateInput'],
        Post: ['thingCreateInput'],
      },
    };

    const result = composeDerivativeInputs([empty, ForView]);

    const expectedResult = {
      '': empty,
      ForView,
    };
    expect(result).toEqual(expectedResult);
  });
});
