// @flow

import type { ThingConfig } from '../../../../flowTypes';

import transformData from './transformData';
import transformWhere from './transformWhere';
import transformWhereOne from './transformWhereOne';
import transformWhereOnes from './transformWhereOnes';

const transformBefore = (args: Object, thingConfig: ThingConfig): Object => {
  const { data, where, whereOne, whereOnes, ...rest } = args;

  const result: { data?: Object, where?: Object, whereOne?: Object, whereOnes?: Object } = {
    ...rest,
  };

  if (data) {
    result.data = transformData(data);
  }

  if (where) {
    result.where = transformWhere(where, thingConfig);
  }

  if (whereOne) {
    result.whereOne = transformWhereOne(whereOne);
  }

  if (whereOnes) {
    result.whereOnes = transformWhereOnes(whereOnes, thingConfig);
  }

  return result;
};

export default transformBefore;
