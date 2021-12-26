// @flow

import deepEqual from 'fast-deep-equal';

import type { ThingConfig } from '../../../../../flowTypes';

import processDeleteData from '../../../processDeleteData';

const mixTrees = (
  tree: Object,
  tree2: Object,
  idsAndThingConfigs: null | [Object] | [Object, string, Object, ThingConfig],
  core: Map<ThingConfig, Array<Object>>,
): Object => {
  if (!idsAndThingConfigs) {
    throw new TypeError('idsAndThingConfigs not defined!');
  }
  if (!idsAndThingConfigs) return {};

  const [currentBranch] = idsAndThingConfigs;

  const fieldNames = Object.keys(currentBranch);

  const result = fieldNames.reduce((prev, fieldName) => {
    if (currentBranch[fieldName][0] && Array.isArray(currentBranch[fieldName][0])) {
      prev[fieldName] = []; // eslint-disable-line no-param-reassign
      currentBranch[fieldName].forEach((idsAndThingConfigs2, i) => {
        if (deepEqual(tree[fieldName][i], tree2[fieldName][i])) {
          const [, { _id: id }] = currentBranch[fieldName][i];

          prev[fieldName].push(id);
        } else {
          const [, thing, thingConfig] = currentBranch[fieldName][i];

          processDeleteData(
            thing,
            core,
            thingConfig,
            true, // forDelete
          );

          prev[fieldName].push(
            mixTrees(tree[fieldName][i], tree2[fieldName][i], idsAndThingConfigs2, core),
          );
        }
      });
    } else if (deepEqual(tree[fieldName], tree2[fieldName])) {
      const [, { _id: id }] = currentBranch[fieldName];

      prev[fieldName] = id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    } else {
      const [, thing, thingConfig] = currentBranch[fieldName];

      processDeleteData(
        thing,
        core,
        thingConfig,
        true, // forDelete
      );

      prev[fieldName] = mixTrees(tree[fieldName], tree2[fieldName], currentBranch[fieldName], core); // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  return Object.assign(tree, result);
};

export default mixTrees;
