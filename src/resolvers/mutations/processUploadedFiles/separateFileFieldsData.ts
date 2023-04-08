import type {EntityConfig, UploadOptions} from '../../../tsTypes';

type Result = {
  forUpdate: {
    [fileFieldName: string]: any
  },
  forPush: {
    [fileFieldName: string]: Array<any>
  }
};

const separateFileFieldsData = (data: Array<any>, options: UploadOptions, entityConfig: EntityConfig): Result => {
  const { fileFields } = entityConfig;

  if (!fileFields) throw new TypeError('There are no fileFields for upload!');
  const isArray = fileFields.reduce<Record<string, any>>((prev, { array, name }) => {
    prev[name] = array; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  const { targets, counts } = options;

  let index = 0;
  return targets.reduce(
    (prev, name, i) => {
      if (isArray[name]) {
        const newIndex = index + counts[i];
        // eslint-disable-next-line no-param-reassign
        prev.forPush[name] = data.slice(index, newIndex);
        index = newIndex;
      } else {
        // eslint-disable-next-line no-param-reassign
        prev.forUpdate[name] = data[index];
        index += 1;
      }
      return prev;
    },
    { forUpdate: {}, forPush: {} },
  );
};

export default separateFileFieldsData;
