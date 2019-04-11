// @flow

type RelationalField = {
  name: string,
  thingName: string,
  required?: boolean,
  array?: boolean,
};
type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
export type ThingConfig = {
  relationalFields?: Array<RelationalField>,
  textFields?: Array<TextField>,
  thingName: string,
};
