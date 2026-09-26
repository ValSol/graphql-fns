# Інтеграція graphql-fns з better-auth

> API better-auth звірено з вихідним кодом пакетів `better-auth@1.7.6` і `@better-auth/mongo-adapter@1.7.6` з npm. Сам механізм авторизації graphql-fns описано в [schema-and-resolvers-analysis.md, §13](./schema-and-resolvers-analysis.md#13-авторизація-користувачів).

## 1. Принцип

graphql-fns не працює з сесіями чи паролями. Про користувача він дізнається з однієї функції проєкту, `serversideConfig.getUserAttributes`:

```ts
getUserAttributes: (context, token?: string) => Promise<{ roles: string[]; id?: string; [key: string]: any }>
```

- `roles` обов'язковий. Решта полів (`id`, `email`, `organizationId`…) передається у функції `filters` поруч із `role`.
- `id` потрібен для `personalFilters`: це id запису сутності User **у graphql-fns** (див. §5).
- `token` — значення аргументу `token: String`, який мають root query, мутації і `node`.
- Бібліотека викликає функцію **один раз** на пару (`context`, `token`) і кешує результат (B23). Тому `context` має створюватися для кожного запиту.

Завдання інтеграції: у `getUserAttributes` отримати сесію better-auth і перетворити її на `{ id, roles, … }`.

## 2. Відповідність

| Потреба graphql-fns | better-auth | Як поєднати |
|---|---|---|
| Хто користувач | `auth.api.getSession({ headers })` → `{ user, session }` або `null` | Викликати в `getUserAttributes` |
| Заголовки з Node `IncomingMessage` | `fromNodeHeaders` з `better-auth/node` | `fromNodeHeaders(context.req.headers)` |
| `roles: string[]` | Плагін `admin`: `user.role` — **рядок**, кілька ролей через кому (`"admin,user"`), за замовчуванням `defaultRole` = `"user"`; `user.banned` | `user.role.split(',')` |
| Ролі в організації | Плагін `organization`: `session.activeOrganizationId`, роль учасника (теж через кому) через `auth.api.getActiveMember` (кидає помилку, якщо активної організації немає) | Додати ролі учасника до `roles`, `organizationId` — в атрибути для `filters` |
| Аргумент `token` | Плагін `bearer` читає `Authorization: Bearer <token>` | Перетворити `token` на заголовок |
| `id` | MongoDB-адаптер зберігає `_id` як `ObjectId`, віддає `id` рядком з 24 hex-символів | Той самий формат, що в graphql-fns |
| Навантаження на БД | `session.cookieCache` — сесія в підписаному cookie без звернення до БД | Увімкнути |
| Гість | `getSession` → `null` | Повертати роль `guest` (§4) |

## 3. Налаштування better-auth

```ts
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, bearer } from 'better-auth/plugins';

export const auth = betterAuth({
  database: mongodbAdapter(db), // db — екземпляр Db з драйвера mongodb
  plugins: [admin(), bearer()],
  session: { cookieCache: { enabled: true, maxAge: 60 } },
  databaseHooks: {
    user: { create: { after: syncGraphqlFnsUser } }, // див. §5
  },
});
```

## 4. `getUserAttributes`

```ts
import type { UserAttributes } from 'graphql-fns';
import { fromNodeHeaders } from 'better-auth/node';

const GUEST: UserAttributes = { id: null, roles: ['guest'] };

const getUserAttributes = async (context, token?: string): Promise<UserAttributes> => {
  const headers = fromNodeHeaders(context.req.headers);

  if (token) headers.set('authorization', `Bearer ${token}`);

  const result = await auth.api.getSession({ headers });

  if (!result || result.user.banned) return GUEST;

  const { user } = result;

  return {
    id: user.id,
    email: user.email,
    roles: (user.role ?? 'user').split(',').map((role) => role.trim()),
  };
};
```

Кешувати результат у проєкті не потрібно: бібліотека сама викликає `getUserAttributes` один раз на запит, навіть якщо запит зачіпає сотні field-resolvers. Невдалий виклик не кешується.

### 4.1. Ролі в організації

```ts
const organizationId = result.session.activeOrganizationId ?? null;

// без активної організації getActiveMember кидає APIError (NO_ACTIVE_ORGANIZATION)
const member = organizationId ? await auth.api.getActiveMember({ headers }) : null;

return {
  id: user.id,
  organizationId,
  roles: [
    ...(user.role ?? 'user').split(','),
    ...(member ? member.role.split(',').map((role) => `org:${role}`) : []),
  ].map((role) => role.trim()),
};
```

Префікс `org:` розводить глобальні ролі й ролі в організації, якщо назви збігаються (`admin`).

### 4.2. Налаштування ролей у graphql-fns

```ts
const serversideConfig = composeServersideConfig(generalConfig, {
  getUserAttributes,

  containedRoles: {
    guest: [],
    user: ['guest'],
    admin: ['user', 'guest'],
  },

  inventoryByRoles: {
    guest: { name: 'guest', include: { Query: { entities: ['Post'], entity: ['Post'] } } },
    user: { name: 'user', include: { Mutation: { createEntity: ['Post'], updateEntity: ['Post'] } } },
    admin: { name: 'admin' }, // без include — усі дії
  },

  filters: {
    Post: ({ role, id }) => {
      switch (role) {
        case 'admin':
          return [];
        case 'user':
          return [{ author: id }, { published: true }];
        case 'guest':
          return [{ published: true }];
        default:
          return null;
      }
    },
  },
});
```

- Кожна роль, яку може видати better-auth, має бути в `containedRoles` і `inventoryByRoles` (`composeServersideConfig` перевіряє, що ключі збігаються).
- Роль, якої немає в `containedRoles`, graphql-fns ігнорує: вона не дає доступу й не ламає запит (B24). Тож нова роль, створена в better-auth, не відкриє дані, доки її не описано в конфігурації.
- Функції `filters` на старті викликаються для кожної ролі з `containedRoles` з тестовими атрибутами, тому гілка `default` має повертати `null`, а не кидати помилку для відомих ролей.

## 5. Сутність User і `personalFilters`

`personalFilters` шукають сутність User **graphql-fns** за `userAttributes.id`. graphql-fns зберігає її в колекції `user_things` (модель `User_Thing`), а better-auth — у колекції `user`. Потрібен запис User у graphql-fns з тим самим id.

Рекомендований спосіб — хук better-auth `databaseHooks.user.create.after`:

```ts
import { createThingSchema } from 'graphql-fns';

const syncGraphqlFnsUser = async (user) => {
  const UserThing =
    mongooseConn.models.User_Thing ||
    mongooseConn.model('User_Thing', createThingSchema(allEntityConfigs.User, enums));

  await UserThing.updateOne(
    { _id: user.id },
    { $setOnInsert: { _id: user.id, email: user.email } },
    { upsert: true },
  );
};
```

- Записувати напряму в модель, а не через згенеровану мутацію: мутація пройде авторизацію, а в хуку користувача ще немає сесії.
- Якщо в User є duplex-поля, їх треба заповнювати мутаціями graphql-fns пізніше, щоб бібліотека підтримувала зворотні посилання.
- Альтернатива — назвати колекцію better-auth `user_things` через `user.modelName`. Не раджу: mongoose-схема graphql-fns не знає полів better-auth, а better-auth не знає `createdAt`/`updatedAt` і полів graphql-fns.

## 6. Subscriptions

- Авторизація виконується **один раз**, під час підписки. Якщо сесію відкликати або користувача заблокувати, він отримуватиме події до перепідключення. Під час виходу чи блокування закривайте WebSocket-з'єднання користувача.
- У subscriptions немає аргументу `token`, користувач визначається лише з `context`. Для `graphql-ws` передавайте в `context` заголовки upgrade-запиту або токен з `connectionParams`, і читайте їх у `getUserAttributes`:

```ts
useServer(
  {
    schema,
    context: (ctx) => ({
      mongooseConn,
      pubsub,
      req: { headers: ctx.extra.request.headers },
      connectionToken: ctx.connectionParams?.token,
    }),
  },
  wsServer,
);
```

  У `getUserAttributes`: `const bearer = token ?? context.connectionToken;`.
- Функція `context` викликається для кожної операції, тож кеш `userAttributes` (B23) не переживає одну підписку. Не передавайте в `context` статичний об'єкт, спільний для всього з'єднання: атрибути зафіксуються на весь час його життя.

## 7. Безпека

| Ризик | Рекомендація |
|---|---|
| Аргумент `token` потрапляє в тіло запиту, логи й кеш persisted queries | Для HTTP — cookie або заголовок `Authorization`; `token` лише там, де заголовок неможливий |
| Відмова в доступі повертає `null`, а не помилку | Так задумано бібліотекою; клієнт не відрізнить «немає доступу» від «не знайдено» |
| Помилки конфігурації (`Not found "getUserAttributes" callback…`) віддаються клієнту | Маскувати внутрішні помилки (`formatError` в Apollo, `maskedErrors` у graphql-yoga) |
| `getUserAttributes` повертає `null` | З `filters` / `inventoryByRoles` це `TypeError` на кожному запиті. Завжди повертайте хоча б `{ roles: ['guest'] }` |
| Заблокований користувач (`user.banned`) | better-auth не створює йому нових сесій, але наявна сесія з `cookieCache` може жити до `maxAge`. Перевіряйте `banned` у `getUserAttributes`, як у §4 |
