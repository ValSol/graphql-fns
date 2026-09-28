import type { TangibleEntityConfig } from '@/tsTypes';

import canBeCopyTarget from './canBeCopyTarget';

describe('canBeCopyTarget', () => {
  const personConfig = {} as TangibleEntityConfig;
  const personCloneConfig = {} as TangibleEntityConfig;
  const placeConfig: TangibleEntityConfig = {
    name: 'Place',
    type: 'tangible',
    textFields: [{ name: 'name', type: 'textFields' }],
    duplexFields: [
      {
        name: 'citizens',
        oppositeName: 'location',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
      {
        name: 'visitors',
        oppositeName: 'favoritePlace',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
    ],
  };

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'firstName',
        required: true,
        type: 'textFields',
      },
      {
        name: 'lastName',
        required: true,
        type: 'textFields',
      },
    ],
    duplexFields: [
      {
        name: 'friends',
        oppositeName: 'friends',
        config: personConfig,
        array: true,
        required: true,
        type: 'duplexFields',
      },
      {
        name: 'enemies',
        oppositeName: 'enemies',
        array: true,
        config: personConfig,
        type: 'duplexFields',
      },
      {
        name: 'location',
        oppositeName: 'citizens',
        config: placeConfig,
        required: true,
        parent: true,
        type: 'duplexFields',
      },
      {
        name: 'favoritePlace',
        oppositeName: 'visitors',
        config: placeConfig,
        type: 'duplexFields',
      },
      {
        name: 'clone',
        oppositeName: 'original',
        config: personCloneConfig,
        type: 'duplexFields',
      },
    ],
  });

  Object.assign(personCloneConfig, {
    name: 'PersonClone',
    type: 'tangible',

    textFields: [
      {
        name: 'firstName',
        required: true,
        type: 'textFields',
      },

      {
        name: 'lastName',
        required: true,
        type: 'textFields',
      },
    ],

    duplexFields: [
      {
        name: 'original',
        oppositeName: 'clone',
        config: personConfig,
        required: true,
        type: 'duplexFields',
      },
    ],
  });

  test('should return "true" if duplex field with common fields has array opposite field', () => {
    expect(canBeCopyTarget(personConfig)).toBe(true);
  });

  test('should return "false" if duplex fields have only scalar opposite fields', () => {
    expect(canBeCopyTarget(personCloneConfig)).toBe(false);
  });

  test('should return "false" if there are no common fields to copy', () => {
    expect(canBeCopyTarget(placeConfig)).toBe(false);
  });

  test('should return "false" if the only common field is calculated', () => {
    const postConfig = {} as TangibleEntityConfig;
    const postCopyConfig = {} as TangibleEntityConfig;
    const titleUpper = {
      name: 'titleUpper',
      calculatedType: 'textFields',
      type: 'calculatedFields',
    };

    Object.assign(postConfig, {
      name: 'Post',
      type: 'tangible',
      textFields: [{ name: 'title', type: 'textFields' }],
      duplexFields: [
        {
          name: 'copies',
          oppositeName: 'original',
          array: true,
          config: postCopyConfig,
          type: 'duplexFields',
        },
      ],
      calculatedFields: [titleUpper],
    });

    Object.assign(postCopyConfig, {
      name: 'PostCopy',
      type: 'tangible',
      duplexFields: [
        { name: 'original', oppositeName: 'copies', config: postConfig, type: 'duplexFields' },
      ],
      calculatedFields: [titleUpper],
    });

    expect(canBeCopyTarget(postCopyConfig)).toBe(false);

    postCopyConfig.textFields = [{ name: 'title', type: 'textFields' }];

    expect(canBeCopyTarget(postCopyConfig)).toBe(true);
  });
});
