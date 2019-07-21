// @flow
/* eslint-env jest */
import type { GeneralConfig, ThingConfig } from '../flowTypes';

import composeThingConfigsObject from './composeThingConfigsObject';

describe('composeThingConfigsObject', () => {
  test('should compose Oject of fields', () => {
    const exampleConfig: ThingConfig = {
      name: 'Example',
    };
    const example2Config: ThingConfig = {
      name: 'Example2',
    };
    const example3Config: ThingConfig = {
      name: 'Example3',
    };

    const thingConfigs = [exampleConfig, example2Config, example3Config];

    const generalConfig: GeneralConfig = { thingConfigs };

    const expectedResult = {
      Example: exampleConfig,
      Example2: example2Config,
      Example3: example3Config,
    };

    const result = composeThingConfigsObject(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
