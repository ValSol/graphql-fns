import deepEqual from 'fast-deep-equal';

import type { DataObject, TangibleEntityConfig } from '../../../../../tsTypes';
import type { Core } from '../../../../tsTypes';

import composeFieldsObject from '../../../../../utils/composeFieldsObject';
import processDeleteData from '../../../processDeleteData';
import deleteTree from './deleteTree';

const mixTrees = (
  tree: any,
  tree2: any,
  idsAndEntityConfigs: null | [any, any, TangibleEntityConfig],
  core: Core,
): any => {
  if (!idsAndEntityConfigs) return tree;

  const [currentBranch, , parentEntityConfig] = idsAndEntityConfigs;

  const fieldNames = Object.keys(currentBranch);

  const fieldsObject = composeFieldsObject(parentEntityConfig);

  const result = fieldNames.reduce<Record<string, any>>((prev, fieldName) => {
    const { array } = fieldsObject[fieldName];

    if (array) {
      if (tree[fieldName] === undefined) {
        currentBranch.forEach((currentBranchItem) => deleteTree(currentBranchItem, core));

        return prev;
      }

      const unusedTreeIndexes: Array<any> = [];
      const usedTree2Indexes: Array<any> = [];
      prev[fieldName] = [];
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

          const [, entity, entityConfig] = currentBranch[fieldName][firstUnusedTree2Index];

          processDeleteData(
            entity,
            core,
            entityConfig,
            true, // forDelete
          );

          prev[fieldName][i] = mixTrees(
            tree[fieldName][i],
            tree2[fieldName][firstUnusedTree2Index],
            currentBranch[fieldName][firstUnusedTree2Index],
            core,
          );
        } else {
          prev[fieldName][i] = mixTrees(tree[fieldName][i], {}, null, core);
        }
      });

      tree2[fieldName].forEach((tree2Item, i) => {
        if (!usedTree2Indexes.includes(i)) {
          deleteTree(currentBranch[fieldName][i], core);
        }
      });
    } else if (tree[fieldName] === undefined) {
      deleteTree(currentBranch[fieldName], core);
    } else if (deepEqual(tree[fieldName], tree2[fieldName])) {
      const [, { _id: id }] = currentBranch[fieldName];

      prev[fieldName] = id;
    } else {
      const [, entity, entityConfig] = currentBranch[fieldName];

      processDeleteData(
        entity,
        core,
        entityConfig,
        true, // forDelete
      );

      prev[fieldName] = mixTrees(tree[fieldName], tree2[fieldName], currentBranch[fieldName], core);
    }

    return prev;
  }, {});

  return Object.assign(tree, result);
};

export default mixTrees;
