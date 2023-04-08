import actionAttributes from '../../types/actionAttributes';

const ordinaryActionTypes: {
  [actionName: string]: 'Query' | 'Mutation' | 'Subscription'
} = Object.keys(actionAttributes).reduce(
  (prev, actionName) => {
    prev[actionName] = actionAttributes[actionName].actionType; //  eslint-disable-line no-param-reassign
    return prev;
  },
  {
    createdThing: 'Subscription',
    deletedThing: 'Subscription',
    updatedThing: 'Subscription',
  },
);

const fieldAttrCount = 5;

export default { ordinaryActionTypes, fieldAttrCount };
