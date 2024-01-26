/* eslint-env jest */

import type { EntityConfig } from '../../../tsTypes';

import toGlobalId from '../toGlobalId';
import whereToGlobalIds from '.';

describe('whereToGlobalIds', () => {
  const personConfig = {} as EntityConfig;
  const personCloneConfig = {} as EntityConfig;

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
        name: 'clone',
        oppositeName: 'original',
        config: personCloneConfig,
        type: 'duplexFields',
      },
      {
        name: 'clones',
        array: true,
        oppositeName: 'oneOforiginals',
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

      {
        name: 'oneOforiginals',
        oppositeName: 'clones',
        config: personConfig,
        type: 'duplexFields',
      },
    ],
  });

  const id1 = '1';
  const id2 = '2';
  const id3 = '3';
  const id4 = '4';

  test('check transform', async () => {
    const where = {
      id: id4,
      firstName: 'aaa',
      id_in: [id1, id2],
      id_nin: [id3, id4],
      clone_in: [id1, id2],
      clone_nin: [id3, id4],
      AND: [
        {
          firstName: 'bbb',
          id_nin: [id1, id2],
          id_in: [id3, id4],
          clone: id1,
          clone_ne: id3,
        },
      ],
      clone_: {
        firstName: 'ccc',
        id_in: [id1, id2],
        id_nin: [id3, id4],
        original_in: [id1, id2],
        original_nin: [id3, id4],
        AND: [
          {
            firstName: 'ddd',
            id_nin: [id1, id2],
            id_in: [id3, id4],
            original: id1,
            original_ne: id3,
          },
        ],
      },
    };

    const expectedResult = {
      firstName: 'aaa',
      id: toGlobalId(id4, 'Person'),
      id_in: [toGlobalId(id1, 'Person'), toGlobalId(id2, 'Person')],
      id_nin: [toGlobalId(id3, 'Person'), toGlobalId(id4, 'Person')],
      clone_in: [toGlobalId(id1, 'PersonClone'), toGlobalId(id2, 'PersonClone')],
      clone_nin: [toGlobalId(id3, 'PersonClone'), toGlobalId(id4, 'PersonClone')],
      AND: [
        {
          firstName: 'bbb',
          id_nin: [toGlobalId(id1, 'Person'), toGlobalId(id2, 'Person')],
          id_in: [toGlobalId(id3, 'Person'), toGlobalId(id4, 'Person')],
          clone: toGlobalId(id1, 'PersonClone'),
          clone_ne: toGlobalId(id3, 'PersonClone'),
        },
      ],
      clone_: {
        firstName: 'ccc',
        id_in: [toGlobalId(id1, 'PersonClone'), toGlobalId(id2, 'PersonClone')],
        id_nin: [toGlobalId(id3, 'PersonClone'), toGlobalId(id4, 'PersonClone')],
        original_in: [toGlobalId(id1, 'Person'), toGlobalId(id2, 'Person')],
        original_nin: [toGlobalId(id3, 'Person'), toGlobalId(id4, 'Person')],
        AND: [
          {
            firstName: 'ddd',
            id_nin: [toGlobalId(id1, 'PersonClone'), toGlobalId(id2, 'PersonClone')],
            id_in: [toGlobalId(id3, 'PersonClone'), toGlobalId(id4, 'PersonClone')],
            original: toGlobalId(id1, 'Person'),
            original_ne: toGlobalId(id3, 'Person'),
          },
        ],
      },
    };

    const result = await whereToGlobalIds(where, personConfig);

    expect(result).toEqual(expectedResult);
  });
});
