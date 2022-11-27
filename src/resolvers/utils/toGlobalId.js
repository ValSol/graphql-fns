// @flow

const toGlobalId = (id: string, entityName: string, suffix?: string = ''): string =>
  btoa(`${id}:${entityName}:${suffix}`);

export default toGlobalId;
