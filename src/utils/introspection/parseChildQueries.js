// @flow

import type { GeneralConfig } from '../../flowTypes';
import type { ChildQueries } from './flowTypes';

const parseChildQueries = (
  childQueries: Array<string>,
  generalConfig: GeneralConfig,
): ChildQueries => {
  const { entityConfigs, derivative } = generalConfig;

  return childQueries.map((item) => {
    const [baseAction, derivativeThingName] = item.split(':');

    if (entityConfigs[derivativeThingName]) {
      return { actionName: baseAction, baseAction, suffix: '', entityName: derivativeThingName };
    }

    if (derivative) {
      const suffixes = Object.keys(derivative);

      for (let i = 0; i < suffixes.length; i += 1) {
        const suffix = suffixes[i];

        if (derivativeThingName.endsWith(suffix)) {
          const entityName = derivativeThingName.slice(0, -suffix.length);

          if (entityConfigs[entityName]) {
            return {
              actionName: `${baseAction}${suffix}`,
              baseAction,
              suffix,
              entityName,
            };
          }
        }
      }
    }

    throw new TypeError(`Not parsed childQuery: "${item}"!`);
  });
};

export default parseChildQueries;
