// @flow
import type { ServersideConfig, ThreeSegmentInventoryChain } from '../flowTypes';

import authorize from '../utils/authorize';
import checkInventory from '../utils/checkInventory';
import getProjectionFromInfo from './getProjectionFromInfo';

type Arg = {
  inventoryChain: ThreeSegmentInventoryChain,
  resolverArgs: { parent: Object, args: Object, context: Object, info: Object },
  serversideConfig: ServersideConfig,
  returnScalar?: boolean,
  credentials?: null | { id: string, roles: Array<string> },
};

const executeAuthorisation = async ({
  inventoryChain,
  resolverArgs,
  serversideConfig,
  returnScalar,
  credentials,
}: Arg) => {
  const { authData, getCredentials, unrestricted } = serversideConfig;
  const { args, context, info } = resolverArgs;
  if (getCredentials && !(unrestricted && checkInventory(inventoryChain, unrestricted))) {
    if (!getCredentials) {
      throw new TypeError('Must set "getCredentials" config method!');
    }

    let credentials2;
    if (!credentials) {
      credentials2 = await getCredentials(context);
    }

    const credentials3 = credentials || credentials2;
    // if returnScalar use fake 'boo' field to check fields
    const fields = returnScalar ? ['foo'] : Object.keys(getProjectionFromInfo(info));

    const authorized = await authorize(inventoryChain, fields, credentials3, args, authData);
    if (!authorized) {
      throw new TypeError('Athorize Error!');
    }
    return credentials3;
  }
  return null;
};

export default executeAuthorisation;
