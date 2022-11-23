// @flow
/* eslint-env jest */

import checkUnsetsFields from './index';

describe('checkUnsetsFields', () => {
  test('should return correct result', () => {
    const thingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'menu',
          required: true,
        },
      ],
    };

    const preparedBulk = [
      {
        updateOne: { filter: { _id: '6123f99fd979d80236892098' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d80236892099' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d8023689209a' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d8023689209b' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d8023689209c' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d8023689209d' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d8023689209e' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d8023689209f' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d802368920a0' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d802368920a1' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d802368920a2' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d802368920a3' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d802368920a4' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d802368920a6' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: { filter: { _id: '6123f99fd979d802368920a5' }, update: { $unset: { menu: 1 } } },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d80236892098' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d80236892099' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d8023689209a' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d8023689209b' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d8023689209c' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d8023689209d' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d8023689209e' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d8023689209f' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d802368920a0' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d802368920a1' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d802368920a2' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d802368920a3' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d802368920a4' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d802368920a5' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
      {
        updateOne: {
          filter: { _id: '6123f99fd979d802368920a6' },
          update: { menu: '6123f99fd979d80236892097' },
        },
      },
    ];

    const result = checkUnsetsFields(preparedBulk, thingConfig);

    expect(result).toEqual(undefined);
  });
});
