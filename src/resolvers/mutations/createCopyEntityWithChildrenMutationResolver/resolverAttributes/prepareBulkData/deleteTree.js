// @flow

import type { EntityConfig } from '../../../../../flowTypes';

import composeFieldsObject from '../../../../../utils/composeFieldsObject';
import processDeleteData from '../../../processDeleteData';

const deleteTree = (
  idsAndEntityConfigs: null | [Object, Object, EntityConfig],
  core: Map<EntityConfig, Array<Object>>,
) => {
  if (!idsAndEntityConfigs) return;

  const [currentBranch, entity, entityConfig] = idsAndEntityConfigs;

  const fieldNames = Object.keys(currentBranch);

  const fieldsObject = composeFieldsObject(entityConfig);

  processDeleteData(
    entity,
    core,
    entityConfig,
    true, // forDelete
  );

  fieldNames.forEach((fieldName) => {
    const {
      attributes: { array },
    } = fieldsObject[fieldName];

    if (array) {
      currentBranch[fieldName].forEach((idsAndEntityConfigs2) => {
        deleteTree(idsAndEntityConfigs2, core);
      });
    } else {
      deleteTree(currentBranch[fieldName], core);
    }
  });
};

export default deleteTree;
