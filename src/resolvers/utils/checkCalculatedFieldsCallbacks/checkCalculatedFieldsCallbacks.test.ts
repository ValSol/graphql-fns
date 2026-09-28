import type { RepresentationAttributes, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';

describe('checkCalculatedFieldsCallbacks', () => {
  const exampleConfig: SimplifiedEntityConfig = {
    name: 'Example',
    counter: true,
    textFields: [{ name: 'text' }],
    calculatedFields: [
      { name: 'upper', calculatedType: 'textFields' },
      { name: 'remote', calculatedType: 'textFields', async: true },
    ],
  };

  const allEntityConfigs = composeAllEntityConfigs([exampleConfig]);

  const func = () => '';
  const asyncFunc = async () => '';

  const compose = (serversideConfig: ServersideConfig) =>
    composeTypeDefsAndResolvers({ allEntityConfigs }, serversideConfig);

  test('should pass with matching callbacks', () => {
    expect(() =>
      compose({
        calculatedFields: {
          Example: {
            upper: { func, fieldsToUseNames: ['text', 'id', 'createdAt', 'counter'] },
            remote: { func, asyncFunc },
          },
        },
      }),
    ).not.toThrow();
  });

  test('should throw if callbacks are missed', () => {
    expect(() =>
      compose({ calculatedFields: { Example: { remote: { func, asyncFunc } } } }),
    ).toThrow('Not found callbacks of calculated field "upper" of entity "Example"');
  });

  test('should throw if "func" is missed', () => {
    expect(() =>
      compose({
        calculatedFields: { Example: { upper: {} as any, remote: { func, asyncFunc } } },
      }),
    ).toThrow('Not found "func" of calculated field "upper" of entity "Example"');
  });

  test('should throw if "async: true" has no "asyncFunc"', () => {
    expect(() =>
      compose({ calculatedFields: { Example: { upper: { func }, remote: { func } } } }),
    ).toThrow('Calculated field "remote" of entity "Example" has "async: true"');
  });

  test('should throw if "asyncFunc" has no "async: true"', () => {
    expect(() =>
      compose({
        calculatedFields: { Example: { upper: { func, asyncFunc }, remote: { func, asyncFunc } } },
      }),
    ).toThrow('but not has "async: true"');
  });

  test('should throw for incorrect "fieldsToUseNames"', () => {
    expect(() =>
      compose({
        calculatedFields: {
          Example: { upper: { func, fieldsToUseNames: ['unknown'] }, remote: { func, asyncFunc } },
        },
      }),
    ).toThrow('Incorrect field: "unknown" in "fieldsToUseNames" of calculated field "upper"');
  });

  test('should throw for callbacks of unknown field', () => {
    expect(() =>
      compose({
        calculatedFields: {
          Example: { upper: { func }, remote: { func, asyncFunc }, extra: { func } },
        },
      }),
    ).toThrow('have no calculated field "extra"');
  });

  test('should throw for callbacks of unknown entity', () => {
    expect(() =>
      compose({
        calculatedFields: {
          Example: { upper: { func }, remote: { func, asyncFunc } },
          Unknown: { upper: { func } },
        },
      }),
    ).toThrow('Unknown entity "Unknown" in "serversideConfig.calculatedFields"');
  });

  test('should check calculated fields added by a representation', () => {
    const ForCatalog: RepresentationAttributes = {
      allow: { Example: ['entity'] },
      representationKey: 'ForCatalog',
      addFields: {
        Example: { calculatedFields: [{ name: 'catalogTitle', calculatedType: 'textFields' }] },
      },
    };

    const generalConfig = { allEntityConfigs, representations: { ForCatalog } };

    const calculatedFields = {
      Example: { upper: { func }, remote: { func, asyncFunc } },
    };

    expect(() => composeTypeDefsAndResolvers(generalConfig, { calculatedFields })).toThrow(
      'Not found callbacks of calculated field "catalogTitle" of entity "ExampleForCatalog"',
    );

    expect(() =>
      composeTypeDefsAndResolvers(generalConfig, {
        calculatedFields: { ...calculatedFields, ExampleForCatalog: { catalogTitle: { func } } },
      }),
    ).not.toThrow();
  });

  test('should check "fieldsToUseNames" against fields of the config the callbacks are taken from', () => {
    const ForCatalog: RepresentationAttributes = {
      allow: { Example: ['entity'] },
      representationKey: 'ForCatalog',
      excludeFields: { Example: ['text'] },
      addFields: {
        Example: { calculatedFields: [{ name: 'catalogTitle', calculatedType: 'textFields' }] },
      },
    };

    const generalConfig = { allEntityConfigs, representations: { ForCatalog } };

    // inherited "upper" uses "text" excluded by the representation: the root collection is queried
    const calculatedFields = {
      Example: { upper: { func, fieldsToUseNames: ['text'] }, remote: { func, asyncFunc } },
    };

    expect(() =>
      composeTypeDefsAndResolvers(generalConfig, {
        calculatedFields: { ...calculatedFields, ExampleForCatalog: { catalogTitle: { func } } },
      }),
    ).not.toThrow();

    expect(() =>
      composeTypeDefsAndResolvers(generalConfig, {
        calculatedFields: {
          ...calculatedFields,
          ExampleForCatalog: { catalogTitle: { func, fieldsToUseNames: ['unknown'] } },
        },
      }),
    ).toThrow(
      'Incorrect field: "unknown" in "fieldsToUseNames" of calculated field "catalogTitle" of entity "ExampleForCatalog"',
    );

    // callbacks of the representation's own name are checked against the representation's fields
    expect(() =>
      composeTypeDefsAndResolvers(generalConfig, {
        calculatedFields: {
          ...calculatedFields,
          ExampleForCatalog: {
            catalogTitle: { func },
            upper: { func, fieldsToUseNames: ['text'] },
          },
        },
      }),
    ).toThrow(
      'Incorrect field: "text" in "fieldsToUseNames" of calculated field "upper" of entity "ExampleForCatalog"',
    );
  });

  test('should forbid callbacks in the declaration of a calculated field', () => {
    expect(() =>
      composeAllEntityConfigs([
        {
          name: 'Example',
          calculatedFields: [{ name: 'upper', calculatedType: 'textFields', func } as any],
        },
      ]),
    ).toThrow('Forbidden "func" in calculated field: "upper"');
  });
});
