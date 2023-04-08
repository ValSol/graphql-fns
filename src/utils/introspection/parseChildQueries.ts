import type {GeneralConfig} from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

const parseChildQueries = (childQueries: Array<string>, generalConfig: GeneralConfig): ChildQueries => {
  const { allEntityConfigs, derivative } = generalConfig;

  return childQueries.map((item) => {
    const [baseAction, derivativeThingName] = item.split(':');

    if (allEntityConfigs[derivativeThingName]) {
      return {
        actionName: baseAction,
        baseAction,
        derivativeKey: '',
        entityName: derivativeThingName,
      };
    }

    if (derivative) {
      const derivativeKeys = Object.keys(derivative);

      for (let i = 0; i < derivativeKeys.length; i += 1) {
        const derivativeKey = derivativeKeys[i];

        if (derivativeThingName.endsWith(derivativeKey)) {
          const entityName = derivativeThingName.slice(0, -derivativeKey.length);

          if (allEntityConfigs[entityName]) {
            return {
              actionName: `${baseAction}${derivativeKey}`,
              baseAction,
              derivativeKey,
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
