// @flow
/* eslint-env jest */

import toGlobalId from '../../toGlobalId';
import transformFileWhere from './transformFileWhere';

describe('transformFileWhere', () => {
  const id1 = '1';
  const id2 = '2';
  const id3 = '3';
  const id4 = '4';

  test('check transform', async () => {
    const where = {
      firstName: 'aaa',
      id_in: [toGlobalId(id1, 'Image'), toGlobalId(id2, 'Image')],
      id_nin: [toGlobalId(id3, 'Image'), toGlobalId(id4, 'Image')],
      AND: [
        {
          firstName: 'bbb',
          id_nin: [toGlobalId(id1, 'Image'), toGlobalId(id2, 'Image')],
          id_in: [toGlobalId(id3, 'Image'), toGlobalId(id4, 'Image')],
        },
      ],
    };

    const result = await transformFileWhere(where);

    const expectedResult = {
      firstName: 'aaa',
      id_in: [id1, id2],
      id_nin: [id3, id4],
      AND: [
        {
          firstName: 'bbb',
          id_nin: [id1, id2],
          id_in: [id3, id4],
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
