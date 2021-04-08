// @flow

import pluralize from 'pluralize';

type Arg = { actionName: string, thingName: string };

const composeSpecificActionName = (arg: Arg): string => {
  const { actionName, thingName } = arg;
  if (actionName.search('things') !== -1) {
    return actionName.replace('things', pluralize(thingName));
  }
  if (actionName.search('Things') !== -1) {
    return actionName.replace('Things', pluralize(thingName));
  }
  if (actionName.search('thing') !== -1) {
    return actionName.replace('thing', thingName);
  }
  if (actionName.search('Thing') !== -1) {
    return actionName.replace('Thing', thingName);
  }
  throw new TypeError(`Incorrect actionName: ${actionName}!`);
};

export default composeSpecificActionName;
