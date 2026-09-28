import mongoose from 'mongoose';
import { graphql, parse, subscribe } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import type { GeneralConfig, ServersideConfig, SimplifiedEntityConfig } from '@/tsTypes';

import mongoOptions from '@/test/mongo-options';
import pubsub from '@/resolvers/utils/pubsub';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import fromGlobalId from '@/resolvers/utils/fromGlobalId';
import sleep from '@/utils/sleep';

// End-to-end behaviour of calculated fields through real GraphQL operations.
// The declarations and the callbacks are kept apart, so that only "composeConfigs" has to change
// when the callbacks move from "generalConfig" to "serversideConfig" (docs/calculated-fields.md).

type AsyncCall = { field: string; list: boolean; length: number; args: Record<string, any> };
type FuncCall = {
  field: string;
  index: number;
  rawId: boolean;
  rawAuthor: boolean;
  data: Record<string, any>;
  args: Record<string, any>;
  rootArgs: Record<string, any>;
};

const calls: { asyncFunc: AsyncCall[]; func: FuncCall[] } = { asyncFunc: [], func: [] };

const resetCalls = () => {
  calls.asyncFunc = [];
  calls.func = [];
};

const isMongoId = (value: unknown) =>
  typeof value === 'object' && value !== null && /^[0-9a-f]{24}$/.test(String(value));

const recordFunc =
  (field: string, compute: (args: any, data: any, asyncFuncResult: any, index: number) => any) =>
  (args, data, resolverArg, asyncFuncResult, index) => {
    calls.func.push({
      field,
      index,
      rawId: isMongoId(data.id),
      rawAuthor: data.author === undefined || data.author === null || isMongoId(data.author),
      data,
      args,
      rootArgs: resolverArg?.args,
    });

    return compute(args, data, asyncFuncResult, index);
  };

// "asyncFunc" gets an entity object for single-entity actions and an array for list actions
const recordAsyncFunc =
  (field: string, computeOne: (entity: any, i: number) => any) =>
  async (args, resolverCreatorArg, resolverArg, entityOrEntities) => {
    const list = Array.isArray(entityOrEntities);

    calls.asyncFunc.push({
      field,
      list,
      length: list ? entityOrEntities.length : 1,
      args: resolverArg.args,
    });

    return list ? entityOrEntities.map(computeOne) : computeOne(entityOrEntities, -1);
  };

const pickByIndex = (args, data, asyncFuncResult, index) =>
  Array.isArray(asyncFuncResult) ? asyncFuncResult[index] : asyncFuncResult;

const declarations: SimplifiedEntityConfig[] = [
  { name: 'Label', type: 'embedded', textFields: [{ name: 'text' }] },
  {
    name: 'Summary',
    type: 'virtual',
    textFields: [{ name: 'text' }],
    intFields: [{ name: 'position' }],
  },
  { name: 'BookActor', type: 'virtual', textFields: [{ name: 'editor' }] },
  { name: 'Author', textFields: [{ name: 'name' }] },
  {
    name: 'Book',
    subscriptionActorConfigName: 'BookActor',
    allowedCalculatedWithAsyncFuncFieldNames: ['editor'],
    textFields: [{ name: 'title', index: true }],
    intFields: [{ name: 'price' }],
    relationalFields: [{ name: 'author', oppositeName: 'books', configName: 'Author' }],
    calculatedFields: [
      { name: 'titleUpper', calculatedType: 'textFields' },
      { name: 'priceWithTax', calculatedType: 'floatFields', inputTypes: { rate: 'Float' } },
      { name: 'summary', calculatedType: 'virtualFields', configName: 'Summary', async: true },
      { name: 'editor', calculatedType: 'textFields', async: true },
      { name: 'labels', calculatedType: 'embeddedFields', configName: 'Label', array: true },
      {
        name: 'sameAuthorBooks',
        calculatedType: 'filterFields',
        configName: 'Book',
        array: true,
      },
    ],
  } as SimplifiedEntityConfig,
];

const callbacks: ServersideConfig['calculatedFields'] = {
  Book: {
    titleUpper: {
      fieldsToUseNames: ['title'],
      func: recordFunc('titleUpper', (args, data) => data.title.toUpperCase()),
    },
    priceWithTax: {
      fieldsToUseNames: ['price'],
      func: recordFunc('priceWithTax', (args, data) => data.price * (1 + (args?.rate ?? 0))),
    },
    summary: {
      fieldsToUseNames: ['title'],
      asyncFunc: recordAsyncFunc('summary', (entity, i) => ({ text: entity.title, position: i })),
      func: recordFunc('summary', pickByIndex),
    },
    editor: {
      fieldsToUseNames: ['title'],
      asyncFunc: recordAsyncFunc('editor', (entity) => `editor of ${entity.title}`),
      func: recordFunc('editor', pickByIndex),
    },
    labels: {
      fieldsToUseNames: ['title'],
      func: recordFunc('labels', (args, data) =>
        data.title.split('').map((text: string) => ({ text })),
      ),
    },
    sameAuthorBooks: {
      fieldsToUseNames: ['author'],
      func: recordFunc('sameAuthorBooks', (args, data) =>
        data.author ? JSON.stringify({ author: String(data.author) }) : null,
      ),
    },
  },
};

// the only place that knows where the callbacks live
const composeConfigs = (): {
  generalConfig: GeneralConfig;
  serversideConfig: ServersideConfig;
} => ({
  generalConfig: { allEntityConfigs: composeAllEntityConfigs(declarations) },
  serversideConfig: { calculatedFields: callbacks },
});

const { generalConfig, serversideConfig } = composeConfigs();
const { typeDefs, resolvers } = composeTypeDefsAndResolvers(generalConfig, serversideConfig);
const schema = makeExecutableSchema({ typeDefs, resolvers });

let mongooseConn;

const contextValue = (pubsub2: any = pubsub) => ({ mongooseConn, pubsub: pubsub2 });

const run = async (source: string, pubsub2?: any) => {
  const result = await graphql({ schema, source, contextValue: contextValue(pubsub2) });

  if (result.errors) throw result.errors[0];

  return result.data as Record<string, any>;
};

const funcCalls = (field: string) => calls.func.filter((call) => call.field === field);
const asyncCalls = (field: string) => calls.asyncFunc.filter((call) => call.field === field);

mongoose.set('strictQuery', false);

let authorId: string;
const bookIds: Record<string, string> = {};

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-calculated-fields';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();

  const { createAuthor } = await run('mutation { createAuthor(data: { name: "Tolkien" }) { id } }');
  authorId = createAuthor.id;

  for (const [title, price, withAuthor] of [
    ['abc', 10, true],
    ['def', 20, true],
    ['ghi', 30, true],
    ['xyz', 40, false],
  ] as const) {
    const author = withAuthor ? `, author: { connect: "${authorId}" }` : '';

    const { createBook } = await run(
      `mutation { createBook(data: { title: "${title}", price: ${price}${author} }) { id } }`,
    );

    bookIds[title] = createBook.id;
  }
});

afterAll(async () => {
  await mongooseConn.connection.close();
  await mongoose.disconnect();
});

beforeEach(resetCalls);

describe('calculated fields: queries', () => {
  test('single entity: sync fields, field args, asyncFunc gets the entity object', async () => {
    const { Book } = await run(`{
      Book(whereOne: { id: "${bookIds.abc}" }) {
        titleUpper
        priceWithTax(rate: 0.5)
        summary { text position }
        editor
      }
    }`);

    expect(Book).toEqual({
      titleUpper: 'ABC',
      priceWithTax: 15,
      summary: { text: 'abc', position: -1 },
      editor: 'editor of abc',
    });

    expect(asyncCalls('summary')).toEqual([expect.objectContaining({ list: false, length: 1 })]);
    expect(funcCalls('summary').map(({ index }) => index)).toEqual([0]);
    expect(funcCalls('priceWithTax')[0].args).toEqual({ rate: 0.5 });
  });

  test('aliases of a calculated field with different args', async () => {
    const { Book } = await run(`{
      Book(whereOne: { id: "${bookIds.abc}" }) {
        half: priceWithTax(rate: 0.5)
        full: priceWithTax(rate: 1)
      }
    }`);

    expect(Book).toEqual({ half: 15, full: 20 });
  });

  test('list: asyncFunc runs once for the whole list, func picks its element by index', async () => {
    const { Books } = await run(`{
      Books(sort: { sortBy: [title_ASC] }) { title summary { text position } }
    }`);

    expect(Books).toEqual([
      { title: 'abc', summary: { text: 'abc', position: 0 } },
      { title: 'def', summary: { text: 'def', position: 1 } },
      { title: 'ghi', summary: { text: 'ghi', position: 2 } },
      { title: 'xyz', summary: { text: 'xyz', position: 3 } },
    ]);

    expect(asyncCalls('summary')).toEqual([expect.objectContaining({ list: true, length: 4 })]);
    expect(funcCalls('summary').map(({ index }) => index)).toEqual([0, 1, 2, 3]);
  });

  test('asyncFunc is not called for fields that are not requested', async () => {
    await run('{ Books { titleUpper } }');

    expect(calls.asyncFunc).toEqual([]);
    expect(funcCalls('titleUpper')).toHaveLength(4);
    expect(funcCalls('summary')).toHaveLength(0);
  });

  test('fieldsToUseNames are fetched even if not requested', async () => {
    const { Books } = await run('{ Books(sort: { sortBy: [title_ASC] }) { titleUpper } }');

    expect(Books.map(({ titleUpper }) => titleUpper)).toEqual(['ABC', 'DEF', 'GHI', 'XYZ']);
  });

  test('func gets the raw entity (mongo ids) and the root resolver args', async () => {
    await run(`{ Books(token: "t1") { titleUpper } }`);

    const titleUpperCalls = funcCalls('titleUpper');

    expect(titleUpperCalls).toHaveLength(4);

    titleUpperCalls.forEach(({ rawId, rootArgs }) => {
      expect(rawId).toBe(true);
      expect(rootArgs.token).toBe('t1');
    });

    await run(`{ Book(whereOne: { id: "${bookIds.abc}" }) { sameAuthorBooksCount } }`);

    const [{ rawAuthor, data }] = funcCalls('sameAuthorBooks');

    expect(rawAuthor).toBe(true);
    expect(data.author).toBeDefined();
  });

  test('connection: index refers to the fetched list', async () => {
    const { BooksThroughConnection } = await run(`{
      BooksThroughConnection(first: 2, sort: { sortBy: [title_ASC] }) {
        edges { node { title summary { position } } }
      }
    }`);

    expect(BooksThroughConnection.edges).toEqual([
      { node: { title: 'abc', summary: { position: 0 } } },
      { node: { title: 'def', summary: { position: 1 } } },
    ]);

    expect(asyncCalls('summary')).toEqual([expect.objectContaining({ list: true, length: 3 })]);
  });

  test('nested entities via a relational field get their own asyncFunc call', async () => {
    const { Author } = await run(`{
      Author(whereOne: { id: "${authorId}" }) {
        books(sort: { sortBy: [title_ASC] }) { titleUpper summary { text position } }
      }
    }`);

    expect(Author.books).toEqual([
      { titleUpper: 'ABC', summary: { text: 'abc', position: 0 } },
      { titleUpper: 'DEF', summary: { text: 'def', position: 1 } },
      { titleUpper: 'GHI', summary: { text: 'ghi', position: 2 } },
    ]);

    expect(asyncCalls('summary')).toEqual([expect.objectContaining({ list: true, length: 3 })]);
  });

  test('calculated embedded array with slice', async () => {
    const { Book } = await run(`{
      Book(whereOne: { id: "${bookIds.abc}" }) {
        all: labels { text }
        sliced: labels(slice: { begin: 1 }) { text }
      }
    }`);

    expect(Book).toEqual({
      all: [{ text: 'a' }, { text: 'b' }, { text: 'c' }],
      sliced: [{ text: 'b' }, { text: 'c' }],
    });
  });

  test('calculated filter field in all variants', async () => {
    const { Book } = await run(`{
      Book(whereOne: { id: "${bookIds.abc}" }) {
        sameAuthorBooks(sort: { sortBy: [title_ASC] }) { title }
        sameAuthorBooksCount
        sameAuthorBooksThroughConnection(first: 2, sort: { sortBy: [title_ASC] }) {
          edges { node { title } }
        }
        sameAuthorBooksDistinctValues(options: { target: title })
      }
    }`);

    expect(Book.sameAuthorBooks).toEqual([{ title: 'abc' }, { title: 'def' }, { title: 'ghi' }]);
    expect(Book.sameAuthorBooksCount).toBe(3);
    expect(Book.sameAuthorBooksThroughConnection.edges).toEqual([
      { node: { title: 'abc' } },
      { node: { title: 'def' } },
    ]);
    expect([...Book.sameAuthorBooksDistinctValues].sort()).toEqual(['abc', 'def', 'ghi']);

    const { Book: bookWithoutAuthor } = await run(`{
      Book(whereOne: { id: "${bookIds.xyz}" }) { sameAuthorBooks { title } sameAuthorBooksCount }
    }`);

    expect(bookWithoutAuthor).toEqual({ sameAuthorBooks: [], sameAuthorBooksCount: 0 });
  });
});

describe('calculated fields: programmatic calls of query resolvers', () => {
  const infoEssence = createInfoEssence({ projection: { titleUpper: 1, summary: 1 } });

  const callBook = (resolverOptions: Record<string, any>) =>
    composeQueryResolver('Book', generalConfig, serversideConfig)(
      null,
      { whereOne: { id: fromGlobalId(bookIds.abc)._id } }, // raw resolvers use mongo ids
      contextValue(),
      infoEssence,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] }, ...resolverOptions },
    );

  test('without "materializeCalculatedFields" values are left to field resolvers', async () => {
    const book = await callBook({});

    expect(book.titleUpper).toBeUndefined();
    expect(book.summary).toBeUndefined();
  });

  test('with "materializeCalculatedFields" values are calculated at once', async () => {
    const book = await callBook({ materializeCalculatedFields: true });

    expect(book.titleUpper).toBe('ABC');
    expect(book.summary).toEqual({ text: 'abc', position: -1 });
  });
});

describe('calculated fields: mutations', () => {
  test('single-entity mutation result; asyncFunc does not get the mutation args', async () => {
    const { createBook } = await run(`mutation {
      createBook(data: { title: "new", price: 1 }, token: "t2") {
        titleUpper summary { text position }
      }
    }`);

    expect(createBook).toEqual({ titleUpper: 'NEW', summary: { text: 'new', position: -1 } });

    const [summaryCall] = asyncCalls('summary');

    expect(summaryCall).toEqual(expect.objectContaining({ list: false }));
    expect(summaryCall.args.data).toBeUndefined();
    expect(summaryCall.args.token).toBe('t2');
  });

  test('list mutation result: list cardinality', async () => {
    const { updateManyBooks } = await run(`mutation {
      updateManyBooks(
        whereOne: [{ id: "${bookIds.abc}" }, { id: "${bookIds.def}" }]
        data: [{ price: 11 }, { price: 21 }]
      ) { title priceWithTax summary { text position } }
    }`);

    expect(updateManyBooks).toEqual([
      { title: 'abc', priceWithTax: 11, summary: { text: 'abc', position: 0 } },
      { title: 'def', priceWithTax: 21, summary: { text: 'def', position: 1 } },
    ]);

    // only for the result: the previous entities are neither returned nor reported
    const [summaryCall, ...restSummaryCalls] = asyncCalls('summary');

    expect(summaryCall).toEqual(expect.objectContaining({ list: true, length: 2 }));
    expect(summaryCall.args.data).toBeUndefined();
    expect(restSummaryCalls).toEqual([]);

    await run(`mutation {
      updateManyBooks(
        whereOne: [{ id: "${bookIds.abc}" }, { id: "${bookIds.def}" }]
        data: [{ price: 10 }, { price: 20 }]
      ) { id }
    }`);
  });

  test('single update: the previous entity is calculated too, for "updatedBook" subscription', async () => {
    const { updateBook } = await run(`mutation {
      updateBook(whereOne: { id: "${bookIds.ghi}" }, data: { price: 31 }) {
        priceWithTax summary { text position }
      }
    }`);

    expect(updateBook).toEqual({ priceWithTax: 31, summary: { text: 'ghi', position: -1 } });

    // "updatedBook" is allowed by the inventory, so the report needs "previousNode"
    expect(asyncCalls('summary')).toEqual([
      expect.objectContaining({ list: false }),
      expect.objectContaining({ list: false }),
    ]);

    await run(`mutation {
      updateBook(whereOne: { id: "${bookIds.ghi}" }, data: { price: 30 }) { id }
    }`);
  });

  test('delete mutation returns the previous entity with calculated fields', async () => {
    const { createBook } = await run(
      'mutation { createBook(data: { title: "del", price: 1 }) { id } }',
    );

    resetCalls();

    const { deleteBook } = await run(`mutation {
      deleteBook(whereOne: { id: "${createBook.id}" }) { titleUpper summary { text position } }
    }`);

    expect(deleteBook).toEqual({ titleUpper: 'DEL', summary: { text: 'del', position: -1 } });
    expect(asyncCalls('summary')).toEqual([expect.objectContaining({ list: false })]);
  });
});

describe('calculated fields: subscriptions', () => {
  const subscribeTo = async (source: string, pubsub2?: any) => {
    const result = await subscribe({
      schema,
      document: parse(source),
      contextValue: contextValue(pubsub2),
    });

    if (!(Symbol.asyncIterator in result)) {
      throw new TypeError(`Subscription failed: ${JSON.stringify(result)}`);
    }

    const iterator = result as AsyncGenerator<any>;

    // the PubSub registers its listener lazily, on the first "next()", so it is requested before any mutation
    const first = iterator.next();
    await sleep(100);

    return {
      firstEvent: async () => {
        const { value } = await first;
        await iterator.return(undefined);

        return value;
      },
    };
  };

  test('created: wherePayload by a sync calculated field, actor from an async one', async () => {
    const subscription = await subscribeTo(`subscription {
      createdBook(wherePayload: { titleUpper: "SUB2" }) {
        node { title titleUpper summary { text position } }
        actor { editor }
      }
    }`);

    await run('mutation { createBook(data: { title: "sub1", price: 1 }) { id } }');
    await run('mutation { createBook(data: { title: "sub2", price: 2 }) { id } }');

    const value = await subscription.firstEvent();

    expect(value.errors).toBeUndefined();
    expect(value.data.createdBook).toEqual({
      // an async calculated field that is not in "allowedCalculatedWithAsyncFuncFieldNames" is not
      // published, the field resolver calculates it like for a single-entity action
      node: { title: 'sub2', titleUpper: 'SUB2', summary: { text: 'sub2', position: -1 } },
      actor: { editor: 'editor of sub2' },
    });
  });

  test('created: a serializing PubSub keeps calculated values of the payload', async () => {
    // like PubSub over Redis: the published payload is serialized, the hidden context is lost
    const serializingPubsub = {
      publish: (channel: string, payload: any) =>
        pubsub.publish(channel, JSON.parse(JSON.stringify(payload))),
      subscribe: (channel: string) => pubsub.subscribe(channel),
    };

    const subscription = await subscribeTo(
      `subscription {
        createdBook(wherePayload: { titleUpper: "SUB8" }) {
          node { title titleUpper summary { text position } }
          actor { editor }
        }
      }`,
      serializingPubsub,
    );

    await run(
      'mutation { createBook(data: { title: "sub7", price: 7 }) { id } }',
      serializingPubsub,
    );
    await run(
      'mutation { createBook(data: { title: "sub8", price: 8 }) { id } }',
      serializingPubsub,
    );

    const value = await subscription.firstEvent();

    expect(value.errors).toBeUndefined();
    expect(value.data.createdBook).toEqual({
      node: { title: 'sub8', titleUpper: 'SUB8', summary: { text: 'sub8', position: -1 } },
      actor: { editor: 'editor of sub8' },
    });
  });

  test('created: wherePayload by an allowed async calculated field', async () => {
    const subscription = await subscribeTo(`subscription {
      createdBook(wherePayload: { editor: "editor of sub4" }) { node { title } }
    }`);

    await run('mutation { createBook(data: { title: "sub3", price: 3 }) { id } }');
    await run('mutation { createBook(data: { title: "sub4", price: 4 }) { id } }');

    const value = await subscription.firstEvent();

    expect(value.errors).toBeUndefined();
    expect(value.data.createdBook).toEqual({ node: { title: 'sub4' } });
  });

  test('updated: whichUpdated and updatedFields include calculated fields', async () => {
    const { createBook } = await run(
      'mutation { createBook(data: { title: "sub5", price: 5 }) { id } }',
    );

    const subscription = await subscribeTo(`subscription {
      updatedBook(whichUpdated: { updatedFields: titleUpper }) {
        node { titleUpper }
        previousNode { titleUpper }
        updatedFields
      }
    }`);

    await run(`mutation {
      updateBook(whereOne: { id: "${createBook.id}" }, data: { price: 6 }) { id }
    }`);
    await run(`mutation {
      updateBook(whereOne: { id: "${createBook.id}" }, data: { title: "sub6" }) { id }
    }`);

    const value = await subscription.firstEvent();

    expect(value.errors).toBeUndefined();

    const { node, previousNode, updatedFields } = value.data.updatedBook;

    expect(node).toEqual({ titleUpper: 'SUB6' });
    expect(previousNode).toEqual({ titleUpper: 'SUB5' });
    expect(updatedFields).toEqual(expect.arrayContaining(['title', 'titleUpper']));
    expect(updatedFields).not.toContain('price');
  });
});
