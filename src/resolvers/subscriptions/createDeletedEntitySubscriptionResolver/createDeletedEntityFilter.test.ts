/* eslint-env jest */

import mongoose from 'mongoose';

import type { EntityConfig } from '../../../tsTypes';

import createDeletedEntityFilter from './createDeletedEntityFilter';

describe('createDeletedEntityFilter', () => {
  const entityConfig = {} as EntityConfig;
  Object.assign(entityConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
        type: 'textFields',
      },
    ],
    intFields: [
      {
        name: 'intField',
        index: true,
        type: 'intFields',
      },
    ],
    floatFields: [
      {
        name: 'floatField',
        index: true,
        type: 'floatFields',
      },
    ],
    dateTimeFields: [
      {
        name: 'dateTimeField',
        index: true,
        type: 'dateTimeFields',
      },
    ],
    relationalFields: [
      {
        name: 'relationalField',
        oppositeName: 'parentRelationalField',
        config: entityConfig,
        index: true,
        type: 'relationalFields',
      },
      {
        name: 'parentRelationalField',
        oppositeName: 'relationalField',
        config: entityConfig,
        array: true,
        parent: true,
        type: 'relationalFields',
      },
    ],
    duplexFields: [
      {
        name: 'duplexField',
        config: entityConfig,
        oppositeName: 'duplexField',
        index: true,
        type: 'duplexFields',
      },
    ],
  });

  const payload = {
    deletedPerson: {
      textField: 'abc',
      intField: 123,
      floatField: 0.55,
      dateTimeField: new Date('1980-12-10T22:00:00.000Z'),
      relationalField: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca'),
      duplexField: new mongoose.mongo.ObjectId('56cb91bdc3464f14678934cb'),
    },
  };

  test('should return true if there is no where', () => {
    const filter = createDeletedEntityFilter(entityConfig);

    const args: Record<string, any> = {};

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where is {}', () => {
    const filter = createDeletedEntityFilter(entityConfig);

    const args = { where: {} };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only textField', () => {
    const filter = createDeletedEntityFilter(entityConfig);

    const args = {
      where: {
        textField: 'abc',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only intField', () => {
    const filter = createDeletedEntityFilter(entityConfig);

    const args = {
      where: {
        intField: 123,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only floatField', () => {
    const filter = createDeletedEntityFilter(entityConfig);

    const args = {
      where: {
        floatField: 0.55,
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only dateTimeField', () => {
    const filter = createDeletedEntityFilter(entityConfig);

    const args = {
      where: {
        dateTimeField: new Date('1980-12-10T22:00:00.000Z'),
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only relationalField', () => {
    const filter = createDeletedEntityFilter(entityConfig);

    const args = {
      where: {
        relationalField: '56cb91bdc3464f14678934ca',
      },
    };

    const result = filter(payload, args);

    expect(result).toBe(true);
  });

  test('should return true if where have only relationalField', () => {
    const filter = createDeletedEntityFilter(entityConfig);

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
    const filter = createDeletedEntityFilter(entityConfig);

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
