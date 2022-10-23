// @flow

const toGlobalId = (id: string, thingName: string, suffix?: string = ''): string =>
  btoa(`${id}:${thingName}:${suffix}`);

export default toGlobalId;
