// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingDistinctValuesQuery = (prefixName: string, thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `query ${prefixName}_${name}DistinctValues($where: ${name}WhereInput, $options: ${name}DistinctValuesOptionsInput) {
  ${name}DistinctValues(where: $where, options: $options)
}`;
};

export default composeThingDistinctValuesQuery;
