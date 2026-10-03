import type { SimplifiedEntityConfig } from '../../tsTypes';

import composeAllEntityConfigs from '../../utils/composeAllEntityConfigs';
import composeCopySourceAndTargetInputCreator from './composeCopySourceAndTargetInputCreator';

describe('composeCopySourceAndTargetInputCreator', () => {
  const declarations: SimplifiedEntityConfig[] = [
    {
      name: 'Person',
      type: 'tangible',
      textFields: [{ name: 'firstName' }, { name: 'lastName' }],
      duplexFields: [
        { name: 'backups', oppositeName: 'original', array: true, configName: 'PersonBackup' },
        { name: 'clone', oppositeName: 'original', configName: 'PersonClone' },
      ],
    },
    {
      name: 'PersonBackup',
      type: 'tangible',
      uniqueCompoundIndexes: [['lastName', 'original']],
      textFields: [{ name: 'firstName' }, { name: 'lastName' }],
      duplexFields: [{ name: 'original', oppositeName: 'backups', configName: 'Person' }],
    },
    {
      name: 'PersonClone',
      type: 'tangible',
      textFields: [{ name: 'firstName' }, { name: 'lastName' }],
      duplexFields: [{ name: 'original', oppositeName: 'clone', configName: 'Person' }],
    },
  ];

  const { PersonBackup, PersonClone } = composeAllEntityConfigs(declarations);

  test('should compose items with target & data for copy target', () => {
    const [inputName, inputDefinition, childChain] = composeCopySourceAndTargetInputCreator(
      false,
      true,
    )(PersonBackup);

    expect(inputName).toBe('PersonBackupCopySourceAndTargetAndDataInput');
    expect(inputDefinition).toBe(`input PersonBackupCopySourceAndTargetAndDataInput {
  whereKeyToSource: PersonBackupWhereKeyToSourceInput!
  whereTarget: PersonBackupWhereOneInput
  data: PersonBackupUpdateInput
}`);
    expect(Object.keys(childChain)).toEqual([
      'PersonBackupWhereKeyToSourceInput',
      'PersonBackupWhereOneInput',
      'PersonBackupUpdateInput',
    ]);
  });

  test('should compose items with compound target & without data', () => {
    const [inputName, inputDefinition] = composeCopySourceAndTargetInputCreator(
      true,
      false,
    )(PersonBackup);

    expect(inputName).toBe('PersonBackupCopySourceAndCompoundTargetInput');
    expect(inputDefinition).toBe(`input PersonBackupCopySourceAndCompoundTargetInput {
  whereKeyToSource: PersonBackupWhereKeyToSourceInput!
  whereCompoundTarget: PersonBackupWhereCompoundOneInput!
}`);
  });

  test('should compose items without target if entity can not be copy target', () => {
    expect(composeCopySourceAndTargetInputCreator(false, true)(PersonClone)[1])
      .toBe(`input PersonCloneCopySourceAndTargetAndDataInput {
  whereKeyToSource: PersonCloneWhereKeyToSourceInput!
  data: PersonCloneUpdateInput
}`);

    expect(composeCopySourceAndTargetInputCreator(true, true)(PersonClone)[1]).toBe('');
  });
});
