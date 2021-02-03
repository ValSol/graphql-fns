// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingNearInputType from '../inputs/createThingNearInputType';

const createThingCountQueryType = (thingConfig: ThingConfig): string => {
  const { name, textFields } = thingConfig;

  const mutationArgs = [`where: ${name}WhereInput`];

  const thingNearInputType = createThingNearInputType(thingConfig);
  if (thingNearInputType) mutationArgs.push(`near: ${name}NearInput`);

  const textIndex = textFields ? textFields.some(({ weight }) => weight) : false;
  if (textIndex) mutationArgs.push('search: String');

  return `  ${name}Count(${mutationArgs.join(', ')}): Int!`;
};

export default createThingCountQueryType;
