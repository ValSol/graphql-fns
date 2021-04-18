// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../inputs/createThingNearInputType';

const createThingCountQueryType = (thingConfig: ThingConfig): string => {
  const { name, textFields } = thingConfig;

  const queryArgs = [`where: ${name}WhereInput`];

  const thingNearInputType = createThingNearInputType(thingConfig);
  if (thingNearInputType) queryArgs.push(`near: ${name}NearInput`);

  const textIndex = textFields ? textFields.some(({ weight }) => weight) : false;
  if (textIndex) queryArgs.push('search: String');

  return `  ${name}Count(${queryArgs.join(', ')}): Int!`;
};

export default createThingCountQueryType;
