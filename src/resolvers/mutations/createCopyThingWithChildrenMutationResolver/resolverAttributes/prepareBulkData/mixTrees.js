// @flow

import deepEqual from 'fast-deep-equal';

import type { ThingConfig } from '../../../../../flowTypes';

import composeFieldsObject from '../../../../../utils/composeFieldsObject';
import processDeleteData from '../../../processDeleteData';

const mixTrees = (
  tree: Object,
  tree2: Object,
  idsAndThingConfigs: null | [Object, Object, ThingConfig],
  core: Map<ThingConfig, Array<Object>>,
): Object => {
  if (!idsAndThingConfigs) return tree;

  const [currentBranch, , parentThingConfig] = idsAndThingConfigs;

  const fieldNames = Object.keys(currentBranch);

  const fieldsObject = composeFieldsObject(parentThingConfig);

  const result = fieldNames.reduce((prev, fieldName) => {
    if (tree2[fieldName] === undefined) {
      prev[fieldName] = tree[fieldName]; // eslint-disable-line no-param-reassign

      return prev;
    }

    const {
      attributes: { array },
    } = fieldsObject[fieldName];

    if (array) {
      const unusedTreeIndexes = [];
      const usedTree2Indexes = [];
      prev[fieldName] = []; // eslint-disable-line no-param-reassign
      tree[fieldName].forEach((treeItem, i) => {
        const index = tree2[fieldName].findIndex((tree2Item) => deepEqual(treeItem, tree2Item));

        if (index !== -1 && !usedTree2Indexes.includes(index)) {
          usedTree2Indexes.push(index);
          const [, { _id: id }] = currentBranch[fieldName][index];
          prev[fieldName].push(id);
        } else {
          unusedTreeIndexes.push(i);
          prev[fieldName].push(null); // insert dummy value to replace in next loop
        }
      });

      unusedTreeIndexes.forEach((i) => {
        const firstUnusedTree2Index = tree2[fieldName].findIndex(
          (item, j) => !usedTree2Indexes.includes(j),
        );

        if (firstUnusedTree2Index !== -1) {
          usedTree2Indexes.push(firstUnusedTree2Index);

          const [, thing, thingConfig] = currentBranch[fieldName][firstUnusedTree2Index];

          processDeleteData(
            thing,
            core,
            thingConfig,
            true, // forDelete
          );

          // eslint-disable-next-line no-param-reassign
          prev[fieldName][i] = mixTrees(
            tree[fieldName][i],
            tree2[fieldName][firstUnusedTree2Index],
            currentBranch[fieldName][firstUnusedTree2Index],
            core,
          );
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[fieldName][i] = mixTrees(tree[fieldName][i], {}, null, core);
        }
      });

      tree2[fieldName].forEach((tree2Item, i) => {
        if (!usedTree2Indexes.includes(i)) {
          const [, thing, thingConfig] = currentBranch[fieldName][i];

          processDeleteData(
            thing,
            core,
            thingConfig,
            true, // forDelete
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
