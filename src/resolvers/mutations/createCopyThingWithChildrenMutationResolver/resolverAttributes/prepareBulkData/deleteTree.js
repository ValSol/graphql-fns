// @flow

import type { ThingConfig } from '../../../../../flowTypes';

import composeFieldsObject from '../../../../../utils/composeFieldsObject';
import processDeleteData from '../../../processDeleteData';

const deleteTree = (
  idsAndThingConfigs: null | [Object, Object, ThingConfig],
  core: Map<ThingConfig, Array<Object>>,
) => {
  if (!idsAndThingConfigs) return;

  const [currentBranch, thing, thingConfig] = idsAndThingConfigs;

  const fieldNames = Object.keys(currentBranch);

  const fieldsObject = composeFieldsObject(thingConfig);

  processDeleteData(
    thing,
    core,
    thingConfig,
    true, // forDelete
  );

  fieldNames.forEach((fieldName) => {
    const {
      attributes: { array },
    } = fieldsObject[fieldName];

    if (array) {
      currentBranch[fieldName].forEach((idsAndThingConfigs2) => {
        deleteTree(idsAndThingConfigs2, core);
      });
    } else {
      deleteTree(currentBranch[fieldName], core);
    }
  });
};

export default deleteTree;
