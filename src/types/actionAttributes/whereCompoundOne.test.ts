import type { EntityConfig, SimplifiedEntityConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import copyEntityMutationAttributes from './copyEntityMutationAttributes';
import copyEntityWithChildrenMutationAttributes from './copyEntityWithChildrenMutationAttributes';
import copyManyEntitiesMutationAttributes from './copyManyEntitiesMutationAttributes';
import copyManyEntitiesWithChildrenMutationAttributes from './copyManyEntitiesWithChildrenMutationAttributes';
import deleteEntityMutationAttributes from './deleteEntityMutationAttributes';
import deleteEntityWithChildrenMutationAttributes from './deleteEntityWithChildrenMutationAttributes';
import deleteManyEntitiesMutationAttributes from './deleteManyEntitiesMutationAttributes';
import deleteManyEntitiesWithChildrenMutationAttributes from './deleteManyEntitiesWithChildrenMutationAttributes';
import updateEntityMutationAttributes from './updateEntityMutationAttributes';
import updateManyEntitiesMutationAttributes from './updateManyEntitiesMutationAttributes';

// the args of mutations as they are shown in SDL: an arg is hidden if its input is empty
const composeArgs = (
  { argNames, argTypes, inputCreators }: Record<string, any>,
  entityConfig: EntityConfig,
): string[] =>
  argNames
    .map((argName: string, i: number) => `${argName}: ${argTypes[i](entityConfig)}`)
    .filter((foo: string, i: number) => inputCreators[i](entityConfig)[1]);

const declarations: SimplifiedEntityConfig[] = [
  {
    name: 'Person',
    type: 'tangible',
    textFields: [{ name: 'firstName' }, { name: 'lastName' }],
    duplexFields: [
      { name: 'backups', oppositeName: 'original', array: true, configName: 'PersonBackup' },
      { name: 'notes', oppositeName: 'person', array: true, configName: 'Note', parent: true },
    ],
  },
  {
    name: 'PersonBackup',
    type: 'tangible',
    uniqueCompoundIndexes: [['lastName', 'original']],
    textFields: [{ name: 'firstName' }, { name: 'lastName' }],
    duplexFields: [
      { name: 'original', oppositeName: 'backups', configName: 'Person' },
      {
        name: 'notes',
        oppositeName: 'person',
        array: true,
        configName: 'NoteBackup',
        parent: true,
      },
    ],
  },
  {
    name: 'Note',
    type: 'tangible',
    textFields: [{ name: 'text' }],
    duplexFields: [{ name: 'person', oppositeName: 'notes', configName: 'Person' }],
  },
  {
    name: 'NoteBackup',
    type: 'tangible',
    textFields: [{ name: 'text' }],
    duplexFields: [{ name: 'person', oppositeName: 'notes', configName: 'PersonBackup' }],
  },
];

const { Person, PersonBackup } = composeAllEntityConfigs(declarations);

describe('whereCompoundOne args of mutations', () => {
  test('entity with "uniqueCompoundIndexes": optional "whereOne" and "whereCompoundOne"', () => {
    expect(composeArgs(updateEntityMutationAttributes, PersonBackup)).toEqual([
      'whereOne: PersonBackupWhereOneInput',
      'whereCompoundOne: PersonBackupWhereCompoundOneInput',
      'data: PersonBackupUpdateInput!',
      'token: String',
    ]);

    expect(composeArgs(deleteEntityMutationAttributes, PersonBackup)).toEqual([
      'whereOne: PersonBackupWhereOneInput',
      'whereCompoundOne: PersonBackupWhereCompoundOneInput',
      'token: String',
    ]);

    expect(composeArgs(deleteEntityWithChildrenMutationAttributes, PersonBackup)).toEqual([
      'whereOne: PersonBackupWhereOneInput',
      'whereCompoundOne: PersonBackupWhereCompoundOneInput',
      'options: deletePersonBackupWithChildrenOptionsInput',
      'token: String',
    ]);

    expect(composeArgs(updateManyEntitiesMutationAttributes, PersonBackup)).toEqual([
      'whereOneAndData: [PersonBackupWhereOneAndDataInput!]',
      'whereCompoundOneAndData: [PersonBackupWhereCompoundOneAndDataInput!]',
      'token: String',
    ]);

    expect(composeArgs(deleteManyEntitiesMutationAttributes, PersonBackup)).toEqual([
      'whereOne: [PersonBackupWhereOneInput!]',
      'whereCompoundOne: [PersonBackupWhereCompoundOneInput!]',
      'token: String',
    ]);

    expect(composeArgs(deleteManyEntitiesWithChildrenMutationAttributes, PersonBackup)).toEqual([
      'whereOne: [PersonBackupWhereOneInput!]',
      'whereCompoundOne: [PersonBackupWhereCompoundOneInput!]',
      'options: deletePersonBackupWithChildrenOptionsInput',
      'token: String',
    ]);
  });

  test('copy target with "uniqueCompoundIndexes": "whereCompoundTarget"', () => {
    expect(composeArgs(copyEntityMutationAttributes, PersonBackup)).toEqual([
      'whereKeyToSource: PersonBackupWhereKeyToSourceInput!',
      'options: copyPersonBackupOptionsInput',
      'whereTarget: PersonBackupWhereOneInput',
      'whereCompoundTarget: PersonBackupWhereCompoundOneInput',
      'data: PersonBackupUpdateInput',
      'token: String',
    ]);

    expect(composeArgs(copyEntityWithChildrenMutationAttributes, PersonBackup)).toEqual([
      'whereKeyToSource: PersonBackupWhereKeyToSourceInput!',
      'options: copyPersonBackupOptionsInput',
      'whereTarget: PersonBackupWhereOneInput',
      'whereCompoundTarget: PersonBackupWhereCompoundOneInput',
      'token: String',
    ]);

    expect(composeArgs(copyManyEntitiesMutationAttributes, PersonBackup)).toEqual([
      'sourceAndTargetAndData: [PersonBackupCopySourceAndTargetAndDataInput!]',
      'sourceAndCompoundTargetAndData: [PersonBackupCopySourceAndCompoundTargetAndDataInput!]',
      'options: copyPersonBackupOptionsInput',
      'token: String',
    ]);

    expect(composeArgs(copyManyEntitiesWithChildrenMutationAttributes, PersonBackup)).toEqual([
      'sourceAndTarget: [PersonBackupCopySourceAndTargetInput!]',
      'sourceAndCompoundTarget: [PersonBackupCopySourceAndCompoundTargetInput!]',
      'options: copyPersonBackupOptionsInput',
      'token: String',
    ]);
  });

  test('entity without "uniqueCompoundIndexes": required "whereOne" only', () => {
    expect(composeArgs(updateEntityMutationAttributes, Person)).toEqual([
      'whereOne: PersonWhereOneInput!',
      'data: PersonUpdateInput!',
      'token: String',
    ]);

    expect(composeArgs(updateManyEntitiesMutationAttributes, Person)).toEqual([
      'whereOneAndData: [PersonWhereOneAndDataInput!]!',
      'token: String',
    ]);

    expect(composeArgs(deleteManyEntitiesWithChildrenMutationAttributes, Person)).toEqual([
      'whereOne: [PersonWhereOneInput!]!',
      'options: deletePersonWithChildrenOptionsInput',
      'token: String',
    ]);
  });
});
