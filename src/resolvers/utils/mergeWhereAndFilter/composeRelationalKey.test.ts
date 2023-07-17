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
          type: 'textFields',
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          oppositeName: 'parentRelationalField',
          index: true,
          config: entityConfig,
          type: 'relationalFields',
        },
        {
          name: 'parentRelationalField',
          oppositeName: 'relationalField',
          array: true,
          parent: true,
          config: entityConfig,
          type: 'relationalFields',
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
          type: 'textFields',
        },
      ],

      relationalFields: [
        {
          name: 'restaurants',
          oppositeName: 'access',
          config: restaurantConfig,
          array: true,
          parent: true,
          type: 'relationalFields',
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
          type: 'duplexFields',
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
          type: 'duplexFields',
        },
        {
          name: 'restaurant',
          oppositeName: 'menu',
          config: restaurantConfig,
          required: true,
          index: true,
          type: 'duplexFields',
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
          type: 'duplexFields',
        },
      ],

      relationalFields: [
        {
          name: 'access',
          oppositeName: 'restaurants',
          config: accessConfig,
          index: true,
          type: 'relationalFields',
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

  test('return Textbook Lessons error', () => {
    const lessonConfig = {} as TangibleEntityConfig;
    const userConfig = {} as TangibleEntityConfig;

    const textbookConfig: TangibleEntityConfig = {
      name: 'Textbook',
      type: 'tangible',

      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'lessons',
          oppositeName: 'textbook',
          config: lessonConfig,
          array: true,
          index: true,
          type: 'duplexFields',
        },

        {
          name: 'user',
          oppositeName: 'textbooks',
          config: userConfig,
          required: true,
          index: true,
          type: 'duplexFields',
        },
      ],
    };

    Object.assign(lessonConfig, {
      name: 'Lesson',
      type: 'tangible',

      textFields: [
        {
          name: 'title',
          required: true,
          type: 'textFields',
        },
      ],

      duplexFields: [
        {
          name: 'textbook',
          oppositeName: 'lessons',
          config: lessonConfig,
          required: true,
          index: true,
          type: 'duplexFields',
        },
      ],
    });

    Object.assign(userConfig, {
      name: 'User',
      type: 'tangible',

      textFields: [
        {
          name: 'email',
          required: true,
          type: 'textFields',
          index: true,
        },
      ],

      duplexFields: [
        {
          name: 'textbooks',
          oppositeName: 'user',
          array: true,
          config: textbookConfig,
          index: true,
          type: 'duplexFields',
        },
      ],
    });

    const value = {
      textbook_: {
        user: '5f85ad539905d61fb73346a2',
      },
    };

    const lookupArray: Array<any> = [];

    const result = composeRelationalKey(value, lookupArray, lessonConfig);

    const expectedResult = {
      relationalKey: 'textbook_',
      entityConfig: lessonConfig,
      value: {
        user: '5f85ad539905d61fb73346a2',
      },
    };

    const expectedLookupArray = [':textbook_:Lesson'];

    // expect(transformForJest(result)).toEqual(transformForJest(expectedResult));
    expect(lookupArray).toEqual(expectedLookupArray);
  });
});
