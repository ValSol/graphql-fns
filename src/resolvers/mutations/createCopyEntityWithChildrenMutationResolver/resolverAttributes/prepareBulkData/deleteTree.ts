import type { DataObject, TangibleEntityConfig } from '../../../../../tsTypes';
import type { Core } from '../../../../tsTypes';

import composeFieldsObject from '../../../../../utils/composeFieldsObject';
import processDeleteData from '../../../processDeleteData';

const deleteTree = (idsAndEntityConfigs: null | [any, any, TangibleEntityConfig], core: Core) => {
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
