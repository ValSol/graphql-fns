import type { GraphqlObject, TangibleEntityConfig } from '../../../tsTypes';

const processDeleteDataPrepareArgs = (
  data: GraphqlObject,
  prevData: GraphqlObject,
  entityConfig: TangibleEntityConfig,
): { [key: string]: string } => {
  const { duplexFields } = entityConfig;

  const result = { _id: prevData._id as string };

  if (duplexFields) {
    duplexFields.forEach(({ array, name }) => {
      if (data[name]) {
        result[name] = prevData[name] as string;
      } else if (array) {
        result[name] = [];
      }
    });
  }

  return result;
};

export default processDeleteDataPrepareArgs;
