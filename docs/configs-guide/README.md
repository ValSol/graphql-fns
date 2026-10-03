# Writing `graphql-fns.general.config` and `graphql-fns.serverSide.config`

> A step-by-step guide, from the simplest case to the full set of options. All parts are listed in the [Contents](#contents).
> Describes graphql-fns 0.1.2-beta.1165.
> Marks: ✅ verified by running code (against the MongoDB replica set of the library's tests); 📖 conclusion from reading the code only.

## The two configs

| File | Type | Contains | Where it is imported |
|---|---|---|---|
| `graphql-fns.general.config.ts` | `GeneralConfig` | shape of the API: entities, fields, enums, inventory, signatures of custom actions (no resolvers, callbacks or secrets) | server **and** client code |
| `graphql-fns.serverSide.config.ts` | `ServersideConfig` | behaviour: callbacks of calculated fields, authorization, filters, limits, transactions | server code only |

How to wire the configs into an application (Next.js, GraphQL Yoga, Relay) is described in the [infrastructure guide](../infrastructure-guide/README.md).

The general config is safe to bundle into a client; everything that runs on the server (resolvers, callbacks, access to the database) or is a secret goes into the server-side config. The only functions in the general config are the pure signature methods of custom actions (part 7): they compute names and types from entity configs. For plain data neither needs anything server-side, so part 1 is almost entirely about the general config.

## Contents

| Part | Topic | Config keys | Status |
|---|---|---|---|
| [1](01-plain-arrays.md) | Arrays of plain objects → collections → standard GraphQL API | `allEntityConfigs` (scalar fields, `weight`), `enums` | ✍️ written |
| [2](02-relations.md) | Relations between entities: references by id, parent / children, filter fields | `relationalFields`, `duplexFields`, `filterFields` | ✍️ written |
| [3](03-nested-objects-and-geodata.md) | Nested objects and geodata | `embeddedFields`, `type: 'embedded'`, `geospatialFields` | ✍️ written |
| [4](04-entity-level-options.md) | Entity-level options | `uniqueCompoundIndexes`, `counter`, `interfaces` | ✍️ written |
| [5](05-inventory.md) | Restricting the generated API | `inventory` | ✍️ written |
| [6](06-calculated-fields.md) | Calculated fields | `calculatedFields` + `serversideConfig.calculatedFields` (details: [calculated-fields.md](../calculated-fields.md)) | ✍️ written |
| [7](07-custom-actions.md) | Custom queries and mutations, virtual entities | `custom`, `manualyUsedEntities`, `type: 'virtual'`, `childFields` + `serversideConfig.Query` / `Mutation` | ✍️ written |
| [8](08-representations.md) | Representations | `representations` (details: [representations.md](../representations.md)) | ✍️ written |
| [9](09-subscriptions.md) | Subscriptions | `pubsub` in context, `subscriptionActorConfigName`, `serversideConfig.subscribePayloadFilters` | ✍️ written |
| [10](10-authorization.md) | Authorization and limits | `serversideConfig.getUserAttributes`, `containedRoles`, `inventoryByRoles`, `filters`, `staticFilters`, `personalFilters`, `skipPersonalFilter`, `staticLimits`, `composeServersideConfig` (example: [better-auth-integration.md](../better-auth-integration.md)) | ✍️ written |
| [11](11-transactions.md) | Transactions | `serversideConfig.transactions` | ✍️ written |

