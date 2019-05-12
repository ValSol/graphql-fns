// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

const mongoose = require('mongoose');

const createNewThingFilter = require('./createNewThingFilter');

describe('createNewThingFilter', () => {
  const thingConfig: ThingConfig = {};
  Object.assign(thingConfig, {
    name: 'Person',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
    intFields: [
      {
        name: 'intField',
        index: true,
      },
    ],
    floatFields: [
      {
        name: 'floatField',
        index: true,
      },
    ],
    dateTimeFields: [
      {
        name: 'dateTimeField',
        index: true,
      },
    ],
    relationalFields: [
      {
        name: 'relationalField',
        config: thingConfig,
        index: true,
      },
    ],
    duplexFields: [
      {
        name: 'duplexField',
        config: thingConfig,
        oppositeName: 'duplexField',
        index: true,
      },
    ],
  });

  const payload = {
    newPerson: {
      textField: 'abc',
      intField: 123,
      floatField: 0.55,
      dateTimeField: new Date('1980-12-10T22:00:00.000Z'),
      relationalField: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'),
      duplexField: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934cb'),
    },
  };

  test('should return true if there is no where', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {};

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where is {}', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = { where: {} };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only textField', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {
      where: {
        textField: 'abc',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only intField', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {
      where: {
        intField: 123,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only floatField', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {
      where: {
        floatField: 0.55,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only dateTimeField', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {
      where: {
        dateTimeField: new Date('1980-12-10T22:00:00.000Z'),
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only relationalField', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {
      where: {
        relationalField: '56cb91bdc3464f14678934ca',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only relationalField', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {
      where: {
        relationalField: '56cb91bdc3464f14678934ca',
        duplexField: '56cb91bdc3464f14678934cb',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only textField', () => {
    const filter = createNewThingFilter(thingConfig);

    const args = {
      where: {
        textField: 'abc',
        intField: 123,
        floatField: 0.55,
        dateTimeField: new Date('1980-12-10T22:00:00.000Z'),
        relationalField: '56cb91bdc3464f14678934ca',
        duplexField: '56cb91bdc3464f14678934cb',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });
});
