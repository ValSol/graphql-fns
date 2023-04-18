import { DateTimeResolver } from 'graphql-scalars';
// import GraphQLUpload from 'graphql-upload/public/GraphQLUpload';
import { GraphQLUpload } from 'graphql-upload';

import type { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '../../tsTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import composeDescendantConfigName from '../../utils/composeDescendantConfig/composeDescendantConfigName';
import mergeDescendantIntoCustom from '../../utils/mergeDescendantIntoCustom';
import composeDescendantConfig from '../../utils/composeDescendantConfig';
import { mutationAttributes, queryAttributes } from '../../types/actionAttributes';
import resolverDecorator from '../utils/resolverDecorator';
import composeEntityResolvers from '../types/composeEntityResolvers';
import createCustomResolver from '../createCustomResolver';
import createNodeQueryResolver from '../queries/createNodeQueryResolver';
import queries from '../queries';
import mutations from '../mutations';

import createCreatedEntitySubscriptionResolver from '../subscriptions/createCreatedEntitySubscriptionResolver';
import createUpdatedEntitySubscriptionResolver from '../subscriptions/createUpdatedEntitySubscriptionResolver';
import createDeletedEntitySubscriptionResolver from '../subscriptions/createDeletedEntitySubscriptionResolver';

const composeGqlResolvers = (
  generalConfig: GeneralConfig,
  entityTypeDic: { [entityName: string]: string },

  serversideConfig: ServersideConfig = {},
): any => {
  const { allEntityConfigs, inventory, descendant = {} } = generalConfig;

  const custom = mergeDescendantIntoCustom(generalConfig);

  // eslint-disable-next-line no-nested-ternary
  const customQuery = custom?.Query || {};
  // eslint-disable-next-line no-nested-ternary
  const customMutation = custom?.Mutation || {};

  const allowMutations = checkInventory(['Mutation'], inventory);
  const allowSubscriptions = checkInventory(['Subscription'], inventory);

  const resolvers: Record<string, any> = {};

  resolvers.DateTime = DateTimeResolver;

  resolvers.Upload = GraphQLUpload;

  resolvers.Node = {
    __resolveType: (obj) => obj.__typename, // eslint-disable-line no-underscore-dangle
  };

  resolvers.Query = {
    node: createNodeQueryResolver(generalConfig, serversideConfig),
  };
  if (allowMutations) resolvers.Mutation = {};
  if (allowSubscriptions) resolvers.Subscription = {};

  Object.keys(allEntityConfigs).reduce((prev, entityName) => {
    const entityConfig = allEntityConfigs[entityName];

    Object.keys(queryAttributes).forEach((actionName) => {
      if (
        queryAttributes[actionName].actionAllowed(entityConfig) &&
        !queryAttributes[actionName].actionIsChild
      ) {
        const resolver = queries[actionName](entityConfig, generalConfig, serversideConfig);
        if (resolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Query[queryAttributes[actionName].actionName(entityName)] = resolverDecorator(
            resolver,
            ['Query', actionName, entityConfig.name],
            queryAttributes[actionName],
            entityConfig,
            generalConfig,
            serversideConfig,
          );
        }
      }
    });

    const customQueryNames = Object.keys(customQuery);

    customQueryNames.forEach((customName) => {
      const customQueryResolver = createCustomResolver(
        'Query',
        customName,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

      if (customQueryResolver) {
        // eslint-disable-next-line no-param-reassign
        prev.Query[customQuery[customName].specificName(entityConfig, generalConfig)] =
          customQueryResolver;
      }
    });

    if (allowMutations) {
      Object.keys(mutationAttributes).forEach((actionName) => {
        if (
          mutationAttributes[actionName].actionAllowed(entityConfig) &&
          !mutationAttributes[actionName].actionIsChild
        ) {
          const resolver = mutations[actionName](entityConfig, generalConfig, serversideConfig);
          if (resolver) {
            // eslint-disable-next-line no-param-reassign
            prev.Mutation[mutationAttributes[actionName].actionName(entityName)] =
              resolverDecorator(
                resolver,
                ['Mutation', actionName, entityConfig.name],
                mutationAttributes[actionName],
                entityConfig,
                generalConfig,
                serversideConfig,
              );
          }
        }
      });

      const customMutationNames = Object.keys(customMutation);

      customMutationNames.forEach((customName) => {
        const customMutationResolver = createCustomResolver(
          'Mutation',
          customName,
          entityConfig,
          generalConfig,
          serversideConfig,
        );
        if (customMutationResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Mutation[customMutation[customName].specificName(entityConfig, generalConfig)] =
            customMutationResolver;
        }
      });
    }

    return prev;
  }, resolvers);

  Object.keys(allEntityConfigs)
    .map((entityName) => allEntityConfigs[entityName])
    .filter(({ type: configType }) => configType === 'tangible')
    .reduce((prev, entityConfig) => {
      const { name } = entityConfig;

      if (allowSubscriptions) {
        const createdEntitySubscriptionResolver = createCreatedEntitySubscriptionResolver(
          entityConfig,
          generalConfig,
        );
        if (createdEntitySubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`created${name}`] = createdEntitySubscriptionResolver;
        }

        const deletedEntitySubscriptionResolver = createDeletedEntitySubscriptionResolver(
          entityConfig,
          generalConfig,
        );
        if (deletedEntitySubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`deleted${name}`] = deletedEntitySubscriptionResolver;
        }

        const updatedEntitySubscriptionResolver = createUpdatedEntitySubscriptionResolver(
          entityConfig,
          generalConfig,
        );
        if (updatedEntitySubscriptionResolver) {
          // eslint-disable-next-line no-param-reassign
          prev.Subscription[`updated${name}`] = updatedEntitySubscriptionResolver;
        }
      }

      return prev;
    }, resolvers);

  Object.keys(allEntityConfigs)
    .map((entityName) => allEntityConfigs[entityName])
    .filter(({ type: entityType }) => entityType === 'tangible')
    .reduce((prev, entityConfig: TangibleEntityConfig) => {
      const {
        name,
        descendantNameSlicePosition,
        duplexFields,
        geospatialFields,
        relationalFields,
      } = entityConfig;
      if (entityTypeDic[name] && (duplexFields || geospatialFields || relationalFields)) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = composeEntityResolvers(entityConfig, generalConfig, serversideConfig);
      }

      // process descendant objects fields
      Object.keys(descendant).forEach((descendantKey) => {
        const descendantConfig = composeDescendantConfig(
          descendant[descendantKey],
          entityConfig,
          generalConfig,
        );

        if (descendantConfig && entityTypeDic[descendantConfig.name]) {
          const key = composeDescendantConfigName(name, descendantKey, descendantNameSlicePosition);
          // eslint-disable-next-line no-param-reassign
          prev[key] = composeEntityResolvers(descendantConfig, generalConfig, serversideConfig);
        }
      });

      return prev;
    }, resolvers);

  return resolvers;
};

export default composeGqlResolvers;
