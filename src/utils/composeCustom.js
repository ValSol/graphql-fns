// @flow

import type { Custom, ActionSignatureMethods, ObjectSignatureMethods } from '../flowTypes';

type Arg = {
  Input?: Array<ObjectSignatureMethods>,
  Query?: Array<ActionSignatureMethods>,
  Mutation?: Array<ActionSignatureMethods>,
};

const composeCustom = (arg: Arg): Custom => {
  const { Input, Query, Mutation } = arg;

  const tmp = {};
  const result = {};

  if (Input) {
    result.Input = {};
    Input.forEach((item) => {
      const { name } = item;
      if (tmp[name]) {
        throw TypeError(
          `Unique custom input name: "${name}" already was used in custom ${tmp[name]}!`,
        );
      }
      result.Input[name] = item;
      tmp[name] = 'input';
    });
  }

  if (Query) {
    result.Query = {};
    Query.forEach((item) => {
      const { name } = item;
      if (tmp[name]) {
        throw TypeError(
          `Unique custom query name: "${name}" already was used in custom ${tmp[name]}!`,
        );
      }
      result.Query[name] = item;
      tmp[name] = 'query';
    });
  }

  if (Mutation) {
    result.Mutation = {};
    Mutation.forEach((item) => {
      const { name } = item;
      if (tmp[name]) {
        throw TypeError(
          `Unique custom mutation name: "${name}" already was used in custom ${tmp[name]}!`,
        );
      }
      result.Mutation[name] = item;
      tmp[name] = 'mutation';
    });
  }

  return result;
};

export default composeCustom;
