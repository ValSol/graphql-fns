import type { GeneralConfig, EntityConfig } from '../../../../tsTypes';

import composeDescendantConfigByName from '../../../../utils/composeDescendantConfigByName';
import parseEntityName from '../../../../utils/parseEntityName';
import transformData from './transformData';
import transformFileWhere from './transformFileWhere';
import transformFileWhereOne from './transformFileWhereOne';
import transformWhere from './transformWhere';
import transformWhereOne from './transformWhereOne';
import transformWhereOnes from './transformWhereOnes';

const argTypesInParts = [
  // prefx, suffix, transformer, notUseConfig
  ['', 'CreateInput', transformData, true],
  ['PushInto', 'Input', transformData, true],
  ['', 'UpdateInput', transformData, true],
  ['UploadFilesTo', 'Input', transformData, true],
  ['', 'WhereInput', transformWhere, false],
  ['FileWhereInput', 'FileWhereInput', transformFileWhere, true],
  ['', 'WhereByUniqueInput', transformWhere, false],
  ['', 'WhereOneInput', transformWhereOne, false],
  ['', 'WhereOneToCopyInput', transformWhereOne, false],
  ['FileWhereOneInput', 'FileWhereOneInput', transformFileWhereOne, true],
  ['', 'CopyWhereOnesInput', transformWhereOnes, false],
];

const getPossibleEntityName = (prefix: string, suffix: string, argType: string) =>
  argType.slice(prefix.length, -suffix.length);

const regExp = /[\[\]\!]/g; // eslint-disable-line no-useless-escape

const getTransformerAndConfig = (
  rawArgType: string,
  generalConfig: GeneralConfig,
): null | [any, null | EntityConfig] => {
  const argType = rawArgType.replace(regExp, ''); // eslint-disable-line no-useless-escape

  const results = argTypesInParts.reduce<Array<any>>(
    (prev, [prefix, suffix, transformer, notUseConfig]: [any, any, any, any]) => {
      if (!argType.startsWith(prefix) || !argType.endsWith(suffix)) return prev;

      const possibleEntityName = getPossibleEntityName(prefix, suffix, argType);

      if (notUseConfig) {
        prev.push([transformer, null]);
      } else if (!possibleEntityName) {
        if (prefix === suffix && prefix === argType) {
          prev.push([transformer, null]);
        }
      } else {
        try {
          const { root: entityName, descendantKey } = parseEntityName(
            possibleEntityName,
            generalConfig,
          );

          const { allEntityConfigs } = generalConfig;

          const entityConfig = allEntityConfigs[entityName];

          if (!descendantKey) {
            prev.push([transformer, entityConfig]);
          } else {
            const descendantConfig = composeDescendantConfigByName(
              descendantKey,
              entityConfig,
              generalConfig,
            );

            prev.push([transformer, descendantConfig]);
          }
        } catch {
          // do nothing
        }
      }

      return prev;
    },
    [],
  );

  if (!results.length) return null;

  if (results.length > 1) {
    throw new TypeError(`got more than 1 (${results.length}) results for argType: "${argType}"`);
  }

  const [result] = results;

  return result;
};

export default getTransformerAndConfig;
