/* eslint-env jest */

import mongoose from 'mongoose';

import type { EntityConfig } from '../../../tsTypes';

import createUpdatedEntityFilter from './createUpdatedEntityFilter';

describe('createUpdatedEntityFilter', () => {
  const entityConfig = {} as EntityConfig;
  Object.assign(entityConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'textFieldIndexed',
        index: true,
        type: 'textFields',
      },
      {
        name: 'textFieldUnique',
        unique: true,
        type: 'textFields',
      },
      {
        name: 'textField',
        type: 'textFields',
      },
    ],
    intFields: [
      {
        name: 'intFieldIndexed',
        index: true,
        type: 'intFields',
      },
      {
        name: 'intFieldUnique',
        unique: true,
      },
      {
        name: 'intField',
      },
    ],
    floatFields: [
      {
        name: 'floatFieldIndexed',
        index: true,
        type: 'floatFields',
      },
      {
        name: 'floatFieldUnique',
        unique: true,
        type: 'floatFields',
      },
      {
        name: 'floatField',
        type: 'floatFields',
      },
    ],
    dateTimeFields: [
      {
        name: 'dateTimeFieldIndexed',
        index: true,
        type: 'dateTimeFields',
      },
      {
        name: 'dateTimeFieldUnique',
        unique: true,
        type: 'dateTimeFields',
      },
      {
        name: 'dateTimeField',
        type: 'dateTimeFields',
      },
    ],
    relationalFields: [
      {
        name: 'relationalFieldIndexed',
        config: entityConfig,
        index: true,
        type: 'relationalFields',
      },
      {
        name: 'relationalField',
        config: entityConfig,
        type: 'relationalFields',
      },
    ],
    duplexFields: [
      {
        name: 'duplexFieldIndexed',
        config: entityConfig,
        oppositeName: 'duplexFieldIndexed',
        index: true,
        type: 'duplexFields',
      },
      {
        name: 'duplexField',
        config: entityConfig,
        oppositeName: 'duplexField',
        type: 'duplexFields',
      },
    ],
  });

  const payload = {
    updatedPerson: {
      previousNode: {
        id: '5cd82ca075fb194334d8c1d5',
        textFieldIndexed: 'abc',
        intFieldIndexed: 123,
        floatFieldIndexed: 0.55,
        dateTimeFieldIndexed: new Date('1980-12-10T22:00:00.000Z'),
        relationalFieldIndexed: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'),
        duplexFieldIndexed: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934cb'),
        textFieldUnique: 'ABC',
        intFieldUnique: 111,
        floatFieldUnique: 0.12345,
        dateTimeFieldUnique: new Date('1982-05-25T22:00:00.000Z'),
      },
      node: {
        id: '5cd82ca075fb194334d8c1d5',
        textFieldIndexed: 'xyz',
        intFieldIndexed: 0,
        floatFieldIndexed: 0.0,
        dateTimeFieldIndexed: new Date('1964-12-10T22:00:00.000Z'),
        relationalFieldIndexed: new mongoose.mongo.ObjectId('5cd82fbc609e0149aaf86e9d'),
        duplexFieldIndexed: new mongoose.mongo.ObjectId('5cd830c81654704d2c4edd1e'),
        textFieldUnique: 'ABC',
        intFieldUnique: 111,
        floatFieldUnique: 0.12345,
        dateTimeFieldUnique: new Date('1982-05-25T22:00:00.000Z'),
      },
      updatedFields: [
        'textFieldIndexed',
        'intFieldIndexed',
        'floatFieldIndexed',
        'dateTimeFieldIndexed',
        'relationalFieldIndexed',
        'duplexFieldIndexed',
      ],
    },
  };

  test('should return true if there is no where', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args: Record<string, any> = {};

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where is {}', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = { where: {} };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has correct id', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = { where: { id: ['5cd82ca075fb194334d8c1d5'] } };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return false if where has incorrect id', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = { where: { id: ['5cd82ca075fb194334d8c1d6'] } };

    const result = filter(payload, args);

    expect(result).toBe(false);
  });

  test('should return true if where has only textField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        textFieldIndexed: 'abc',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only intField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        intFieldIndexed: 123,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only floatField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        floatFieldIndexed: 0.55,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only dateTimeField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        dateTimeFieldIndexed: new Date('1980-12-10T22:00:00.000Z'),
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only relationalField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        relationalFieldIndexed: '56cb91bdc3464f14678934ca',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only relationalField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        relationalFieldIndexed: '56cb91bdc3464f14678934ca',
        duplexFieldIndexed: '56cb91bdc3464f14678934cb',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only textField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        textFieldIndexed: 'abc',
        intFieldIndexed: 123,
        floatFieldIndexed: 0.55,
        dateTimeFieldIndexed: new Date('1980-12-10T22:00:00.000Z'),
        relationalFieldIndexed: '56cb91bdc3464f14678934ca',
        duplexFieldIndexed: '56cb91bdc3464f14678934cb',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only textField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        textFieldUnique: ['ABC'],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only intField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        intFieldUnique: [111],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only floatField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        floatFieldUnique: [0.12342, 0.12345],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only dateTimeField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        dateTimeFieldUnique: [new Date('1982-05-25T22:00:00.000Z')],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only textField', () => {
    const filter = createUpdatedEntityFilter(entityConfig);

    const args = {
      where: {
        textFieldIndexed: 'abc',
        intFieldIndexed: 123,
        floatFieldIndexed: 0.55,
        dateTimeFieldIndexed: new Date('1980-12-10T22:00:00.000Z'),
        relationalFieldIndexed: '56cb91bdc3464f14678934ca',
        duplexFieldIndexed: '56cb91bdc3464f14678934cb',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });
});
