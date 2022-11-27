// @flow

import pluralize from 'pluralize';

type Arg = { actionName: string, entityName: string };

const composeSpecificActionName = (arg: Arg): string => {
  const { actionName, entityName } = arg;
  if (actionName.search('entities') !== -1) {
    return actionName.replace('entities', pluralize(entityName));
  }
  if (actionName.search('Entities') !== -1) {
    return actionName.replace('Entities', pluralize(entityName));
  }
  if (actionName.search('entity') !== -1) {
    return actionName.replace('entity', entityName);
  }
  if (actionName.search('Entity') !== -1) {
    return actionName.replace('Entity', entityName);
  }

  throw new TypeError(`Incorrect actionName: ${actionName}!`);
};

export default composeSpecificActionName;
