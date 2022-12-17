// @flow

const toGlobalId = (id: string, entityName: string, derivativeKey?: string = ''): string =>
  btoa(`${id}:${entityName}:${derivativeKey}`);

export default toGlobalId;
