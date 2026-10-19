import type { GraphqlObject } from '@/tsTypes';

const isSet = (value: unknown) => value !== undefined && value !== null;

// items of "whereOneAndData" or "whereCompoundOneAndData" (exactly one of them is expected), every...
// ... item has the same shape as args of "getOrCreateEntity": "whereOne" or "whereCompoundOne" & "data"
const composeItems = (args: GraphqlObject): GraphqlObject[] => {
  const { whereOneAndData, whereCompoundOneAndData } = args;

  if (isSet(whereOneAndData) && isSet(whereCompoundOneAndData)) {
    throw new TypeError(
      'Expected exactly one input from "whereOneAndData" && "whereCompoundOneAndData"!',
    );
  }

  if (!isSet(whereOneAndData) && !isSet(whereCompoundOneAndData)) {
    throw new TypeError('Expected "whereCompoundOneAndData" or "whereOneAndData" input!');
  }

  return (whereOneAndData || whereCompoundOneAndData) as GraphqlObject[];
};

export default composeItems;
