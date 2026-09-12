import type {
  EntityConfig,
  GeneralConfig,
  NearInput,
  ServersideConfig,
  GraphqlObject,
  TangibleEntityConfig,
} from '../../../tsTypes';
import type { Context } from '../../../tsTypes';

import checkRepresentationAction from '../../../utils/checkRepresentationAction';
import childEntityDistinctValuesQueryAttributes from '../../../types/actionAttributes/childEntityDistinctValuesQueryAttributes';
import createChildEntityDistinctValuesQueryResolver from '../../queries/createChildEntityDistinctValuesQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';
import fromGlobalId from '../../utils/fromGlobalId';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityOppositeRelationDistinctValuesResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityOppositeRelationDistinctValuesResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: nameRoot, representationKey } = parseEntityName(name, generalConfig);

  if (!checkRepresentationAction('childEntityDistinctValues', entityConfig, generalConfig)) {
    return null;
  }

  const childEntityDistinctValuesQueryResolver = representationKey
    ? createCustomResolver(
        'Query',
        `childEntityDistinctValues${representationKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityDistinctValuesQueryResolver(entityConfig, generalConfig, serversideConfig),
        ['Query', 'childEntityDistinctValues', nameRoot],
        childEntityDistinctValuesQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntityDistinctValuesQueryResolver) {
    throw new TypeError(
      `Not defined childEntityDistinctValuesQueryResolver "${
        representationKey
          ? `childEntityDistinctValues${representationKey}`
          : 'childEntityDistinctValues'
      }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
    );
  }

  const { relationalFields = [] } = entityConfig as TangibleEntityConfig;

  const oppositeFields = relationalFields.reduce((prev, item) => {
    const {
      parent,
      name: fieldName,
      oppositeName,
      config: { name: oppositeEnityName },
    } = item;
    if (!parent) {
      prev[`${oppositeEnityName}:${oppositeName}`] = fieldName;
    }

    return prev;
  }, {});

  if (Object.keys(oppositeFields).length === 0) {
    throw new TypeError(`Not found parent relational fields in entityConfig: "${name}"!`);
  }

  const resolver = async (
    parent: any,
    args: Args,
    context: Context,
    info: any,
  ): Promise<GraphqlObject[]> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntityDistinctValues${
          representationKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const { id } = parent;

    const { entityName, representationKey: representationKey2 } = fromGlobalId(id);

    const whereById = {
      [oppositeFields[
        `${entityName}${representationKey2}:${fieldName.slice(0, -'DistinctValues'.length)}`
      ]]: id,
    };

    const { where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, whereById] } : whereById;

    const entities = await childEntityDistinctValuesQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityOppositeRelationDistinctValuesResolver
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entities;
  };

  return resolver;
};

export default createEntityOppositeRelationDistinctValuesResolver;
