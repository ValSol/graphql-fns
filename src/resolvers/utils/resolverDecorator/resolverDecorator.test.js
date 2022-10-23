// @flow
/* eslint-env jest */

import type { GeneralConfig, ThingConfig } from '../../../flowTypes';

import toGlobalId from '../toGlobalId';
import resolverDecorator from './index';

describe('resolverDecorator', () => {
  const thingName = 'Example';
  const suffix = '';

  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'title',
      },
    ],
  };

  const thingConfigs = { Example: thingConfig };

  const generalConfig: GeneralConfig = { thingConfigs };

  const parent = null;

  const context = {};

  test('check object result', async () => {
    const id = '33'; // eslint-disable-line no-underscore-dangle
    const func = async (prnt, { title }, cntxt) => ({ id, title }); // eslint-disable-line no-unused-vars

    const decoratedFunc = resolverDecorator(func, thingConfig, thingConfig, generalConfig);

    const title = 'title';
    const result = await decoratedFunc(parent, { title }, context);

    const expectedResult = { id: toGlobalId(id, thingName, suffix), title };

    expect(result).toEqual(expectedResult);
  });

  test('check object array result', async () => {
    // eslint-disable-next-line no-unused-vars
    const func = async (prnt, { titles }, cntxt) =>
      titles.map((title, i) => ({ title, id: `${i}` }));

    const decoratedFunc = resolverDecorator(func, thingConfig, thingConfig, generalConfig);

    const titles = ['title-1', 'title-2', 'title-3'];
    const result = await decoratedFunc(parent, { titles }, context);

    const expectedResult = titles.map((title, i) => ({
      id: toGlobalId(`${i}`, thingName, suffix), // eslint-disable-line no-underscore-dangle
      title,
    }));

    expect(result).toEqual(expectedResult);
  });

  test('check scalar result', async () => {
    const func = async (prnt, { title }, cntxt) => title; // eslint-disable-line  no-unused-vars

    const decoratedFunc = resolverDecorator(func, thingConfig, thingConfig, generalConfig);

    const title = 'title';
    const result = await decoratedFunc(parent, { title }, context);

    const expectedResult = title;

    expect(result).toEqual(expectedResult);
  });

  test('check scalar array result', async () => {
    const func = async (prnt, { titles }, cntxt) => titles; // eslint-disable-line  no-unused-vars

    const decoratedFunc = resolverDecorator(func, thingConfig, thingConfig, generalConfig);

    const titles = ['title-1', 'title-2', 'title-3'];
    const result = await decoratedFunc(parent, { titles }, context);

    const expectedResult = titles;

    expect(result).toEqual(expectedResult);
  });

  test('check null result', async () => {
    const func = async () => null;

    const decoratedFunc = resolverDecorator(func, thingConfig, thingConfig, generalConfig);

    const result = await decoratedFunc(parent, {}, context);

    const expectedResult = null;

    expect(result).toEqual(expectedResult);
  });

  test('check array of nulls & scalars result', async () => {
    // eslint-disable-next-line  no-unused-vars
    const func = async (prnt, { titles }, cntxt) =>
      titles.map((title, i) => (i % 2 ? title : null));

    const decoratedFunc = resolverDecorator(func, thingConfig, thingConfig, generalConfig);

    const titles = ['title-1', 'title-2', 'title-3'];
    const result = await decoratedFunc(parent, { titles }, context);

    const expectedResult = [null, 'title-2', null];

    expect(result).toEqual(expectedResult);
  });

  test('check array of objects & scalars result', async () => {
    // eslint-disable-next-line  no-unused-vars
    const func = async (prnt, { titles }, cntxt) =>
      titles.map((title, i) => (i % 2 ? { title, id: `${i}` } : null));

    const decoratedFunc = resolverDecorator(func, thingConfig, thingConfig, generalConfig);

    const titles = ['title-1', 'title-2', 'title-3'];
    const result = await decoratedFunc(parent, { titles }, context);

    const expectedResult = titles.map((title, i) =>
      i % 2
        ? {
            id: toGlobalId(`${i}`, thingName, suffix), // eslint-disable-line no-underscore-dangle
            title,
          }
        : null,
    );

    expect(result).toEqual(expectedResult);
  });
});
