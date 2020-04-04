// @flow

import { Types } from 'mongoose';

const composeWhereInput = (where: Object): null | Object => {
  if (!where || !Object.keys(where).length) return null;
  const result = {};
  Object.keys(where).forEach((key) => {
    if (key === 'id') {
      // eslint-disable-next-line no-underscore-dangle
      result._id = { $in: where[key].map((id) => Types.ObjectId(id)) };
    } else if (Array.isArray(where[key])) {
      result[key] = { $in: where[key] };
    } else {
      result[key] = where[key];
    }
  });
  return result;
};

export default composeWhereInput;
