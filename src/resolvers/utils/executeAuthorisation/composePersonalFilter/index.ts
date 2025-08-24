import { GeneralConfig, ServersideConfig } from '../../../../tsTypes';

import personalFilterFromFilterEntity from './personalFilterFromFilterEntity';
import personalFilterFromUserEntity from './personalFilterFromUserEntity';

const composePersonalFilter = async (
  entityName: string,
  userAttributes: Record<string, any>,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  const { personalFilters = {}, skipPersonalFilter } = serversideConfig;

  const personalFiltersTuple = personalFilters[entityName];

  if (!personalFiltersTuple) {
    return {};
  }

  if (!userAttributes?.id) {
    return null;
  }

  if (skipPersonalFilter && skipPersonalFilter(entityName, userAttributes)) {
    return {};
  }

  const [, filterEntityPointerName] = personalFiltersTuple;

  const result =
    filterEntityPointerName === 'id'
      ? await personalFilterFromUserEntity(
          personalFiltersTuple,
          userAttributes,
          context,
          generalConfig,
          serversideConfig,
        )
      : await personalFilterFromFilterEntity(
          personalFiltersTuple,
          userAttributes,
          context,
          generalConfig,
          serversideConfig,
        );

  if (!result) {
    return null;
  }

  return JSON.parse(result);
};

export default composePersonalFilter;
