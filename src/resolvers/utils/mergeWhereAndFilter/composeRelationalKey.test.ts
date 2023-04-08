/* eslint-env jest */

import type { GraphqlObject, TangibleEntityConfig } from '../../../tsTypes';

import composeRelationalKey from './composeRelationalKey';

const transformForJest = (obj: {
  entityConfig: TangibleEntityConfig;
  relationalKey: string;
  value: GraphqlObject;
}) => {
  const { entityConfig, ...rest } = obj;
  return { ...rest, entityConfig: entityConfig.name };
};

describe('composeRelationalKey', () => {
  test('return one chain result', () => {
    const entityConfig = {} as TangibleEntityConfig;
    Object.assign(entityConfig, {
      name: 'Example',
      type: 'tangible',
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
          config: entityConfig,
        },
      ],
    });

    const value = { relationalField_: { name: 'test' } };
    const lookupArray: Array<any> = [];

    const result = composeRelationalKey(value, lookupArray, entityConfig);

    const expectedResult = {
      relationalKey: 'relationalField_',
      entityConfig,
      value: { name: 'test' },
    };

    const expectedLookupArray = [':relationalField_:Example'];

    expect(transformForJest(result)).toEqual(transformForJest(expectedResult));
    expect(lookupArray).toEqual(expectedLookupArray);
  });

  test('return one chain result', () => {
    const menusectionConfig = {} as TangibleEntityConfig;
    const menuConfig = {} as TangibleEntityConfig;
    const restaurantConfig = {} as TangibleEntityConfig;

    const accessConfig: TangibleEntityConfig = {
      name: 'Access',
      type: 'tangible',

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
      type: 'tangible',
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
      type: 'tangible',
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
      type: 'tangible',
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

    const lookupArray: Array<any> = [];

    const result = composeRelationalKey(value, lookupArray, menusectionConfig);

    const expectedResult = {
      relationalKey: 'menu_restaurant_access_',
      entityConfig: accessConfig,
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
