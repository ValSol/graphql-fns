import type { DescendantAttributes } from '../../../tsTypes';

type Arg = {
  actionTypes: {
    [actionName: string]: 'Query' | 'Mutation' | 'Subscription';
  };
  descendant: {
    [descendantKey: string]: DescendantAttributes;
  };
};

type Result = {
  descendantActionNames: Array<string>;
  descendantActionTypes: {
    [actionName: string]: string;
  }; // 'DescendantQuery' | 'DescendantMutation',
  thingNamesByDescendantActions: {
    [actionName: string]: Array<string>;
  };
};

const extractDataFromDescendant = (arg: Arg): Result => {
  const { actionTypes, descendant } = arg;

  const actionNames: Array<string> = [];
  const descendantActionTypes: Record<string, any> = {};
  const thingNamesByDescendantActions: Record<string, any> = {};

  Object.keys(descendant).forEach((key) => {
    const { allow, descendantKey } = descendant[key];
    Object.keys(allow).forEach((entityName) => {
      allow[entityName].forEach((actionName) => {
        const descendantActionName = `${actionName}${descendantKey}`;
        if (!actionNames.includes(descendantActionName)) {
          actionNames.push(descendantActionName);
          descendantActionTypes[descendantActionName] = `Descendant${actionTypes[actionName]}`;
          thingNamesByDescendantActions[descendantActionName] = [];
        }
        thingNamesByDescendantActions[descendantActionName].push(entityName);
      });
    });
  });

  const descendantActionNames = [
    ...actionNames.filter((actionName) => descendantActionTypes[actionName] === 'DescendantQuery'),
    ...actionNames.filter(
      (actionName) => descendantActionTypes[actionName] === 'DescendantMutation',
    ),
  ];

  return { descendantActionNames, descendantActionTypes, thingNamesByDescendantActions };
};

export default extractDataFromDescendant;
