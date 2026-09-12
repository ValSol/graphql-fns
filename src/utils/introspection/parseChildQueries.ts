import type { GeneralConfig } from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

const parseChildQueries = (
  childQueries: Array<string>,
  generalConfig: GeneralConfig,
): ChildQueries => {
  const { allEntityConfigs, representation } = generalConfig;

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

    if (representation) {
      const representationKeys = Object.keys(representation);

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
