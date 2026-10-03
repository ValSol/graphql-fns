import type { EntityConfig } from '../../../../tsTypes';

import toGlobalId from '../../toGlobalId';
import transformPairedItems from './transformPairedItems';

describe('transformPairedItems', () => {
  const personConfig = {} as EntityConfig;

  Object.assign(personConfig, {
    name: 'Person',
    type: 'tangible',
    textFields: [{ name: 'lastName', type: 'textFields' }],
    duplexFields: [
      {
        name: 'original',
        oppositeName: 'original',
        config: personConfig,
        type: 'duplexFields',
      },
    ],
  });

  const id1 = '5c9e7c6d3ab6d9b5c2a0e1f1';
  const id2 = '5c9e7c6d3ab6d9b5c2a0e1f2';
  const id3 = '5c9e7c6d3ab6d9b5c2a0e1f3';

  test('should transform every input of items as standalone args', () => {
    const items = [
      {
        whereKeyToSource: { original: { id: toGlobalId(id1, 'Person') } },
        whereTarget: { id: toGlobalId(id2, 'Person') },
        data: { original: { connect: toGlobalId(id3, 'Person') }, lastName: 'Boss' },
      },
      {
        whereOne: { id: toGlobalId(id1, 'Person') },
        whereCompoundOne: { lastName: 'Boss', original: toGlobalId(id2, 'Person') },
        data: { lastName: 'Chanel' },
      },
    ];

    expect(transformPairedItems(items, personConfig)).toEqual([
      {
        whereKeyToSource: { original: { id: id1 } },
        whereTarget: { id: id2 },
        data: { original: { connect: id3 }, lastName: 'Boss' },
      },
      {
        whereOne: { id: id1 },
        whereCompoundOne: { lastName: 'Boss', original: id2 },
        data: { lastName: 'Chanel' },
      },
    ]);
  });

  test('should keep absent inputs', () => {
    expect(
      transformPairedItems(
        { whereKeyToSource: { original: { id: toGlobalId(id1, 'Person') } } },
        personConfig,
      ),
    ).toEqual({ whereKeyToSource: { original: { id: id1 } } });
  });
});
