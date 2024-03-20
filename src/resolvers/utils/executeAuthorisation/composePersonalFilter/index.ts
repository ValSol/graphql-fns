import { GeneralConfig, ServersideConfig } from '../../../../tsTypes';

import personalFilterFromFilterEntity from './personalFilterFromFilterEntity';
import personalFilterFromUserEntity from './personalFilterFromUserEntity';

const store: Record<string, any> = {};

const composePersonalFilter = async (
  entityName: string,
  userAttributes: Record<string, any>,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  const { personalFilters = {} } = serversideConfig;

  const personalFiltersTuple = personalFilters[entityName];

  if (!personalFilters) {
    return {};
  }

  if (!userAttributes?.id) {
    return null;
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
          store,
        )
      : await personalFilterFromFilterEntity(
          personalFiltersTuple,
          userAttributes,
          context,
          generalConfig,
          serversideConfig,
          store,
        );

  if (!result) {
    return null;
  }

  return JSON.parse(result);
};

export default composePersonalFilter;
