import type { GeneralConfig } from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

const parseChildQueries = (
  childQueries: Array<string>,
  generalConfig: GeneralConfig,
): ChildQueries => {
  const { allEntityConfigs, representations } = generalConfig;

  return childQueries.map((item) => {
    const [baseAction, representationThingName] = item.split(':');

    if (allEntityConfigs[representationThingName]) {
      return {
        actionName: baseAction,
        baseAction,
        representationKey: '',
        entityName: representationThingName,
      };
    }

    if (representations) {
      const representationKeys = Object.keys(representations);

      for (let i = 0; i < representationKeys.length; i += 1) {
        const representationKey = representationKeys[i];

        if (representationThingName.endsWith(representationKey)) {
          const entityName = representationThingName.slice(0, -representationKey.length);

          if (allEntityConfigs[entityName]) {
            return {
              actionName: `${baseAction}${representationKey}`,
              baseAction,
              representationKey,
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
