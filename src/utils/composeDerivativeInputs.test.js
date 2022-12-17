// @flow
/* eslint-env jest */
import type { DerivativeInputs } from '../flowTypes';

import composeDerivativeInputs from './composeDerivativeInputs';

describe('composeDerivativeInputs', () => {
  test('compose simple allEntityConfigs', () => {
    const empty: DerivativeInputs = {
      derivativeKey: '',
      allow: {
        Menu: ['entityWhereOneInput', 'entityUpdateInput'],
        MenuSection: ['entityWhereOneInput', 'entityUpdateInput'],
      },
    };

    const ForView: DerivativeInputs = {
      derivativeKey: 'ForView',
      allow: {
        Restaurant: ['entityUpdateInput'],
        Post: ['entityCreateInput'],
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
