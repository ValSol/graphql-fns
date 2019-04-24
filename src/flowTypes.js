// @flow

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
export type ThingConfig = {
  isEmbedded?: boolean,
  duplexFields?: Array<{
    name: string,
    oppositeName: string,
    required?: boolean,
    array?: boolean,
    config: ThingConfig,
  }>,
  embeddedFields?: Array<{
    name: string,
    required?: boolean,
    array?: boolean,
    config: ThingConfig,
  }>,
  relationalFields?: Array<{
    name: string,
    required?: boolean,
    array?: boolean,
    config: ThingConfig,
  }>,
  textFields?: Array<TextField>,
  name: string,
};

export type Periphery = {
  [ThingConfig]: {
    [key: string]: {
      oppositeIds: Array<String>,
      array: Boolean,
      name: String,
      oppositeConfig: ThingConfig,
      oppositeName: String,
    },
  },
};
