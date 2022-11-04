// @flow

import type { GeneralConfig, ThingConfig } from '../../../../flowTypes';

import composeDerivativeConfig from '../../../../utils/composeDerivativeConfig';
import parseThingName from '../../parseThingName';
import transformData from './transformData';
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
  ['FileWhereInput', 'FileWhereInput', transformWhere, true],
  ['', 'WhereByUniqueInput', transformWhere, false],
  ['', 'WhereOneInput', transformWhereOne, false],
  ['', 'WhereOneToCopyInput', transformWhereOne, false],
  ['FileWhereOneInput', 'FileWhereOneInput', transformWhereOne, true],
  ['', 'CopyWhereOnesInput', transformWhereOnes, false],
];

const getPossibleThingName = (prefix: string, suffix: string, argType: string) =>
  argType.slice(prefix.length, -suffix.length);

const regExp = /[\[\]\!]/g; // eslint-disable-line no-useless-escape

const getTransformerAndConfig = (
  rawArgType: string,
  generalConfig: GeneralConfig,
): null | [Function, null | ThingConfig] => {
  const argType = rawArgType.replace(regExp, ''); // eslint-disable-line no-useless-escape

  const results = argTypesInParts.reduce((prev, [prefix, suffix, transformer, notUseConfig]) => {
    if (!argType.startsWith(prefix) || !argType.endsWith(suffix)) return prev;

    const possibleThingName = getPossibleThingName(prefix, suffix, argType);

    if (notUseConfig) {
      prev.push([transformer, null]);
    } else if (!possibleThingName) {
      if (prefix === suffix && prefix === argType) {
        prev.push([transformer, null]);
      }
    } else {
      try {
        const { root: thingName, suffix: derivativeKey } = parseThingName(
          possibleThingName,
          generalConfig,
        );

        const { thingConfigs, derivative } = generalConfig;

        const thingConfig = thingConfigs[thingName];

        if (!derivativeKey) {
          prev.push([transformer, thingConfig]);
        } else {
          const derivativeConfig = composeDerivativeConfig(
            (derivative || {})[derivativeKey],
            thingConfig,
            generalConfig,
          );

          prev.push([transformer, derivativeConfig]);
        }
      } catch {
        // do nothing
      }
    }

    return prev;
  }, []);

  if (!results.length) return null;

  if (results.length > 1) {
    throw new TypeError(`got more than 1 (${results.length}) results for argType: "${argType}"`);
  }

  const [result] = results;

  return result;
};

export default getTransformerAndConfig;
