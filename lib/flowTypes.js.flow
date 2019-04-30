// @flow

type TextField = {
  name: string,
  array?: boolean,
  default?: string | Array<string>,
  index?: boolean,
  required?: boolean,
  unique?: boolean,
};

type Pagination = {
  first: number,
  skip: number,
};

export type ThingConfig = {
  isEmbedded?: boolean,
  duplexFields?: Array<{
    name: string,
    array?: boolean,
    config: ThingConfig,
    index?: boolean,
    oppositeName: string,
    required?: boolean,
  }>,
  embeddedFields?: Array<{
    name: string,
    required?: boolean,
    array?: boolean,
    config: ThingConfig,
  }>,
  relationalFields?: Array<{
    name: string,
    array?: boolean,
    config: ThingConfig,
    index?: boolean,
    required?: boolean,
  }>,
  textFields?: Array<TextField>,
  name: string,
  pagination?: Pagination,
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
