import { GeneralConfig, ServersideConfig } from '../../../../tsTypes';

import getPersonalFilterFromFilterEntity from './getPersonalFilterFromFilterEntity';
import getPersonalFilterFromUserEntity from './getPersonalFilterFromUserEntity';

const store: Record<string, any> = {};

const getPersonalFilter = async (
  personalFiltersTuple: [string, string, string],
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  token?: string,
) => {
  const [, filterEntityPointerName] = personalFiltersTuple;

  const result =
    filterEntityPointerName === 'id'
      ? await getPersonalFilterFromUserEntity(
          personalFiltersTuple,
          context,
          generalConfig,
          serversideConfig,
          store,
          token,
        )
      : await getPersonalFilterFromFilterEntity(
          personalFiltersTuple,
          context,
          generalConfig,
          serversideConfig,
          store,
          token,
        );

  if (!result) {
    return null;
  }

  return JSON.parse(result);
};

export default getPersonalFilter;
