// @flow

import type { GeneralConfig } from '../../flowTypes';
import type { ChildQueries } from './flowTypes';

const parseChildQueries = (
  childQueries: Array<string>,
  generalConfig: GeneralConfig,
): ChildQueries => {
  const { thingConfigs, derivative } = generalConfig;

  return childQueries.map((item) => {
    const [baseAction, derivativeThingName] = item.split(':');

    if (thingConfigs[derivativeThingName]) {
      return { actionName: baseAction, baseAction, suffix: '', thingName: derivativeThingName };
    }

    if (derivative) {
      const suffixes = Object.keys(derivative);

      for (let i = 0; i < suffixes.length; i += 1) {
        const suffix = suffixes[i];

        if (derivativeThingName.endsWith(suffix)) {
          const thingName = derivativeThingName.slice(0, -suffix.length);

          if (thingConfigs[thingName]) {
            return {
              actionName: `${baseAction}${suffix}`,
              baseAction,
              suffix,
              thingName,
            };
          }
        }
      }
    }

    throw new TypeError(`Not parsed childQuery: "${item}"!`);
  });
};

export default parseChildQueries;
