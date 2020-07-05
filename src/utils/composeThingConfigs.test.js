// @flow
/* eslint-env jest */
import type { SimplifiedThingConfig, ThingConfig } from '../flowTypes';

import composeThingConfigs from './composeThingConfigs';

describe('composeThingConfigs', () => {
  test('compose simple thingConfigs', () => {
    const simplifiedThingConfig: SimplifiedThingConfig = {
      name: 'Example',
      intFields: [
        {
          name: 'intField',
        },
        {
          name: 'intFields',
          array: true,
        },
      ],
      floatFields: [
        {
          name: 'floatField',
        },
        {
          name: 'floatFields',
          array: true,
        },
      ],
    };

    const simplifiedThingConfigs = [simplifiedThingConfig];

    const result = composeThingConfigs(simplifiedThingConfigs);
    const expectedResult = { Example: simplifiedThingConfig };
    expect(result).toEqual(expectedResult);
  });

  test('compose relatianal & embedded fields thingConfigs', () => {
    const simplifiedEmbedded3Config: SimplifiedThingConfig = {
      name: 'Embedded3',
      embedded: true,
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          configName: 'Example',
        },
      ],
    };

    const simplifiedEmbedded2Config: SimplifiedThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField3',
          configName: 'Embedded3',
        },
        {
          name: 'embeddedField3a',
          array: true,
          configName: 'Embedded3',
        },
      ],
    };

    const simplifiedEmbeddedConfig: SimplifiedThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField2',
          configName: 'Embedded2',
        },
        {
          name: 'embeddedField2a',
          array: true,
          configName: 'Embedded2',
        },
      ],
    };

    const simplifiedThingConfig: SimplifiedThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded',
          configName: 'Embedded',
        },
        {
          name: 'embeddeda',
          configName: 'Embedded',
          array: true,
        },
      ],
    };

    const simplifiedThingConfigs = [
      simplifiedEmbeddedConfig,
      simplifiedEmbedded2Config,
      simplifiedEmbedded3Config,
      simplifiedThingConfig,
    ];

    const thingConfig: ThingConfig = {};
    const embedded3Config: ThingConfig = {
      name: 'Embedded3',
      embedded: true,
      enumFields: [
        {
          name: 'enumField',
          enumName: 'EnumName',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
        },
      ],
    };

    const embedded2Config: ThingConfig = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField3',
          config: embedded3Config,
        },
        {
          name: 'embeddedField3a',
          array: true,
          config: embedded3Config,
        },
      ],
    };

    const embeddedConfig: ThingConfig = {
      name: 'Embedded',
      embedded: true,
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embeddedField2',
          config: embedded2Config,
        },
        {
          name: 'embeddedField2a',
          array: true,
          config: embedded2Config,
        },
      ],
    };

    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded',
          config: embeddedConfig,
        },
        {
          name: 'embeddeda',
          config: embeddedConfig,
          array: true,
        },
      ],
    });

    const expectedResult = {
      Example: thingConfig,
      Embedded: embeddedConfig,
      Embedded2: embedded2Config,
      Embedded3: embedded3Config,
    };

    const result = composeThingConfigs(simplifiedThingConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose duplex fields thingConfigs', () => {
    const simplifiedThingConfig: SimplifiedThingConfig = {
      name: 'Example',
      duplexFields: [
        {
          name: 'duplexField',
          configName: 'Example',
          oppositeName: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          configName: 'Example',
          oppositeName: 'duplexField',
        },
      ],
    };

    const simplifiedThingConfigs = [simplifiedThingConfig];

    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexFields',
        },
        {
          name: 'duplexFields',
          array: true,
          config: thingConfig,
          oppositeName: 'duplexField',
        },
      ],
    });

    const expectedResult = {
      Example: thingConfig,
    };

    const result = composeThingConfigs(simplifiedThingConfigs);
    expect(result).toEqual(expectedResult);
  });

  test('compose file fields thingConfigs', () => {
    const simplifiedThingConfig: SimplifiedThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          configName: 'Image',
        },
        {
          name: 'pictures',
          configName: 'Image',
          array: true,
        },
      ],
    };

    const simplifiedImageConfig: SimplifiedThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const simplifiedThingConfigs = [simplifiedThingConfig, simplifiedImageConfig];

    const imageConfig: ThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    };

    const expectedResult = {
      Example: thingConfig,
      Image: imageConfig,
    };

    const result = composeThingConfigs(simplifiedThingConfigs);
    expect(result).toEqual(expectedResult);
  });
});
