// @flow
/* eslint-env jest */

import mongoose from 'mongoose';

import type { ThingConfig } from '../../../flowTypes';

import createUpdatedThingFilter from './createUpdatedThingFilter';

describe('createUpdatedThingFilter', () => {
  const thingConfig: ThingConfig = {};
  Object.assign(thingConfig, {
    name: 'Person',
    textFields: [
      {
        name: 'textFieldIndexed',
        index: true,
      },
      {
        name: 'textFieldUnique',
        unique: true,
      },
      {
        name: 'textField',
      },
    ],
    intFields: [
      {
        name: 'intFieldIndexed',
        index: true,
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
      },
      {
        name: 'floatFieldUnique',
        unique: true,
      },
      {
        name: 'floatField',
      },
    ],
    dateTimeFields: [
      {
        name: 'dateTimeFieldIndexed',
        index: true,
      },
      {
        name: 'dateTimeFieldUnique',
        unique: true,
      },
      {
        name: 'dateTimeField',
      },
    ],
    relationalFields: [
      {
        name: 'relationalFieldIndexed',
        config: thingConfig,
        index: true,
      },
      {
        name: 'relationalField',
        config: thingConfig,
      },
    ],
    duplexFields: [
      {
        name: 'duplexFieldIndexed',
        config: thingConfig,
        oppositeName: 'duplexFieldIndexed',
        index: true,
      },
      {
        name: 'duplexField',
        config: thingConfig,
        oppositeName: 'duplexField',
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
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {};

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where is {}', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = { where: {} };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has correct id', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = { where: { id: ['5cd82ca075fb194334d8c1d5'] } };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return false if where has incorrect id', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = { where: { id: ['5cd82ca075fb194334d8c1d6'] } };

    const result = filter(payload, args);

    expect(result).toBe(false);
  });

  test('should return true if where has only textField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        textFieldIndexed: 'abc',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only intField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        intFieldIndexed: 123,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only floatField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        floatFieldIndexed: 0.55,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only dateTimeField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        dateTimeFieldIndexed: new Date('1980-12-10T22:00:00.000Z'),
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only relationalField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        relationalFieldIndexed: '56cb91bdc3464f14678934ca',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only relationalField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

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
    const filter = createUpdatedThingFilter(thingConfig);

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
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        textFieldUnique: ['ABC'],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only intField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        intFieldUnique: [111],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only floatField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        floatFieldUnique: [0.12342, 0.12345],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only dateTimeField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

    const args = {
      where: {
        dateTimeFieldUnique: [new Date('1982-05-25T22:00:00.000Z')],
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where has only textField', () => {
    const filter = createUpdatedThingFilter(thingConfig);

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
