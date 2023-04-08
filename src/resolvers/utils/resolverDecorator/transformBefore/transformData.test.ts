/* eslint-env jest */

import toGlobalId from '../../toGlobalId';
import transformData from './transformData';

describe('transformData', () => {
  const id = '9876543210';
  const globalId = toGlobalId(id, 'entityName');

  const id0 = '1234567890';
  const connect = toGlobalId(id0, 'entityName');

  const id1 = '1';
  const id2 = '2';
  test('check null connect transform', async () => {
    const data = { child: { connect: null } };

    const result = await transformData(data);

    const expectedResult = data;

    expect(result).toEqual(expectedResult);
  });

  test('check single connect transform', async () => {
    const data = {
      id: globalId,
      child: { connect },
      children: { connect: [toGlobalId(id1, 'entityName'), toGlobalId(id2, 'entityName')] },
    };

    const result = await transformData(data);

    const expectedResult = { id, child: { connect: id0 }, children: { connect: [id1, id2] } };

    expect(result).toEqual(expectedResult);
  });

  test('check arrat connect transform', async () => {
    const data = [
      {
        id: globalId,
        child: { connect },
        children: { connect: [toGlobalId(id1, 'entityName'), toGlobalId(id2, 'entityName')] },
      },
    ];

    const result = await transformData(data);

    const expectedResult = [{ id, child: { connect: id0 }, children: { connect: [id1, id2] } }];

    expect(result).toEqual(expectedResult);
  });

  test('check tree create connect transform', async () => {
    const data = {
      child: {
        create: {
          id: globalId,
          child: { connect },
          children: { connect: [toGlobalId(id1, 'entityName'), toGlobalId(id2, 'entityName')] },
        },
      },
    };

    const result = await transformData(data);

    const expectedResult = {
      child: {
        create: {
          id,
          child: { connect: id0 },
          children: { connect: [id1, id2] },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
