// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingDistinctValuesQuery = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `query ${name}DistinctValues($where: ${name}WhereInput, $options: ${name}DistinctValuesOptionsInput) {
  ${name}DistinctValues(where: $where, options: $options)
}`;
};

export default composeThingDistinctValuesQuery;
