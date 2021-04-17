// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../../flowTypes';

import composeRelationalKey from './composeRelationalKey';

const transformForJest = (obj: {
  thingConfig: ThingConfig,
  relationalKey: string,
  value: Object,
}) => {
  const { thingConfig, ...rest } = obj;
  return { ...rest, thingConfig: thingConfig.name };
};

describe('composeRelationalKey', () => {
  test('return one chain result', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'name',
          index: true,
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          index: true,
          config: thingConfig,
        },
      ],
    });

    const value = { relationalField_: { name: 'test' } };
    const lookupArray = [];

    const result = composeRelationalKey(value, lookupArray, thingConfig);

    const expectedResult = {
      relationalKey: 'relationalField_',
      thingConfig,
      value: { name: 'test' },
    };

    const expectedLookupArray = [':relationalField_:Example'];

    expect(transformForJest(result)).toEqual(transformForJest(expectedResult));
    expect(lookupArray).toEqual(expectedLookupArray);
  });

  test('return one chain result', () => {
    const menusectionConfig: ThingConfig = {};
    const menuConfig: ThingConfig = {};
    const restaurantConfig: ThingConfig = {};

    const accessConfig = {
      name: 'Access',

      textFields: [
        {
          name: 'restaurantEditors',
          index: true,
          array: true,
        },
      ],
    };

    Object.assign(menusectionConfig, {
      name: 'Menusection',
      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'sections',
          config: menuConfig,
          required: true,
          index: true,
        },
      ],
    });

    Object.assign(menuConfig, {
      name: 'Menu',
      duplexFields: [
        {
          name: 'sections',
          oppositeName: 'menu',
          array: true,
          config: menusectionConfig,
          required: true,
          index: true,
        },
        {
          name: 'restaurant',
          oppositeName: 'menu',
          config: restaurantConfig,
          required: true,
          index: true,
        },
      ],
    });

    Object.assign(restaurantConfig, {
      name: 'Restaurant',
      duplexFields: [
        {
          name: 'menu',
          oppositeName: 'restaurant',
          config: menuConfig,
          index: true,
        },
      ],

      relationalFields: [
        {
          name: 'access',
          config: accessConfig,
          index: true,
        },
      ],
    });

    const value = {
      menu_: {
        restaurant_: {
          access_: {
            restaurantEditors: '5f85ad539905d61fb73346a2',
          },
        },
      },
    };

    const lookupArray = [];

    const result = composeRelationalKey(value, lookupArray, menusectionConfig);

    const expectedResult = {
      relationalKey: 'menu_restaurant_access_',
      thingConfig: accessConfig,
      value: {
        restaurantEditors: '5f85ad539905d61fb73346a2',
      },
    };

    const expectedLookupArray = [
      ':menu_:Menu',
      'menu_:restaurant_:Restaurant',
      'menu_restaurant_:access_:Access',
    ];

    expect(transformForJest(result)).toEqual(transformForJest(expectedResult));
    expect(lookupArray).toEqual(expectedLookupArray);
  });
});
