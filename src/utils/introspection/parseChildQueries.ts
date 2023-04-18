import type { GeneralConfig } from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

const parseChildQueries = (
  childQueries: Array<string>,
  generalConfig: GeneralConfig,
): ChildQueries => {
  const { allEntityConfigs, descendant } = generalConfig;

  return childQueries.map((item) => {
    const [baseAction, descendantThingName] = item.split(':');

    if (allEntityConfigs[descendantThingName]) {
      return {
        actionName: baseAction,
        baseAction,
        descendantKey: '',
        entityName: descendantThingName,
      };
    }

    if (descendant) {
      const descendantKeys = Object.keys(descendant);

      for (let i = 0; i < descendantKeys.length; i += 1) {
        const descendantKey = descendantKeys[i];

        if (descendantThingName.endsWith(descendantKey)) {
          const entityName = descendantThingName.slice(0, -descendantKey.length);

          if (allEntityConfigs[entityName]) {
            return {
              actionName: `${baseAction}${descendantKey}`,
              baseAction,
              descendantKey,
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
