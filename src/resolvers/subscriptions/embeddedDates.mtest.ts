import mongoose from 'mongoose';
import { graphql, parse, subscribe } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import mongoOptions from '@/test/mongo-options';
import pubsub from '@/resolvers/utils/pubsub';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';

// Dates inside embedded fields (scalar, nested, arrays) have to reach the subscribers and match the
// filters of events the same way with an in-memory PubSub and with serializing ones (JSON, as Redis
// does by default, and Extended JSON)

const allEntityConfigs = composeAllEntityConfigs([
  { name: 'Reminder', type: 'embedded', dateTimeFields: [{ name: 'at', index: true }] },
  {
    name: 'Period',
    type: 'embedded',
    dateTimeFields: [{ name: 'start', index: true }, { name: 'end' }],
    embeddedFields: [{ name: 'reminder', configName: 'Reminder', index: true }],
  },
  {
    name: 'Slot',
    type: 'embedded',
    textFields: [{ name: 'room', index: true }],
    dateTimeFields: [
      { name: 'start', index: true },
      { name: 'marks', array: true, index: true },
    ],
  },
  {
    name: 'Event',
    textFields: [{ name: 'title', unique: true, index: true }],
    embeddedFields: [
      { name: 'period', configName: 'Period', index: true },
      { name: 'slots', configName: 'Slot', array: true, index: true },
    ],
  },
]);

const { typeDefs, resolvers } = composeTypeDefsAndResolvers({ allEntityConfigs }, {});
const schema = makeExecutableSchema({ typeDefs, resolvers });

const serializing = (stringify: (value: any) => string, parseString: (text: string) => any) => ({
  publish: (channel: string, payload: any) =>
    pubsub.publish(channel, parseString(stringify(payload))),
  subscribe: (channel: string) => pubsub.subscribe(channel),
});

const { EJSON } = mongoose.mongo.BSON;

const pubsubs: [string, any][] = [
  ['an in-memory PubSub', pubsub],
  ['a JSON PubSub', serializing(JSON.stringify, JSON.parse)],
  [
    'an Extended JSON PubSub',
    serializing(
      (value) => EJSON.stringify(value),
      (text) => EJSON.parse(text),
    ),
  ],
];

let mongooseConn;

const run = async (source: string, pubsub2: any, variableValues?: Record<string, any>) => {
  const { data, errors } = await graphql({
    schema,
    source,
    variableValues,
    contextValue: { mongooseConn, pubsub: pubsub2 },
  });

  if (errors) throw errors[0];

  return data as Record<string, any>;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// subscribes, runs the mutation and returns the first event, or "null" if none came in 300 ms
const firstEvent = async (pubsub2: any, source: string, mutate: () => Promise<unknown>) => {
  const result = await subscribe({
    schema,
    document: parse(source),
    contextValue: { mongooseConn, pubsub: pubsub2 },
  });

  if (!(Symbol.asyncIterator in result)) {
    throw new TypeError(`Subscription failed: ${JSON.stringify(result)}`);
  }

  const iterator = result as AsyncGenerator<any>;

  // the PubSub registers its listener lazily, on the first "next()", so it is requested before the mutation
  const first = iterator.next();
  await sleep(50);

  await mutate();

  const event = await Promise.race([first, sleep(300).then(() => null)]);

  await iterator.return(undefined);

  if (!event) return null;

  if (event.value.errors) throw event.value.errors[0];

  return event.value.data;
};

const date = (monthAndDay: string) => `2026-${monthAndDay}T10:00:00.000Z`;

const fields = 'title period { start end reminder { at } } slots { id room start marks }';

let counter = 0;

const createEvent = (pubsub2: any) => {
  counter += 1;

  return run(
    `mutation ($data: EventCreateInput!) { createEvent(data: $data) { ${fields} } }`,
    pubsub2,
    {
      data: {
        title: `event-${counter}`,
        period: { start: date('05-01'), end: date('05-02'), reminder: { at: date('04-30') } },
        slots: [
          { room: 'A', start: date('05-01'), marks: [date('05-03')] },
          { room: 'B', start: date('06-01'), marks: [] },
        ],
      },
    },
  );
};

mongoose.set('strictQuery', false);

beforeAll(async () => {
  const dbURI = 'mongodb://127.0.0.1:27017/jest-embedded-dates-of-subscriptions';
  mongooseConn = await mongoose.connect(dbURI, mongoOptions);
  await mongooseConn.connection.db.dropDatabase();
});

afterAll(async () => {
  mongooseConn.connection.close();
});

describe.each(pubsubs)('dates inside embedded fields with %s', (kind, pubsub2) => {
  test('should deliver the dates of the payload as the mutation returns them', async () => {
    let created: any;

    const event = await firstEvent(
      pubsub2,
      `subscription { createdEvent { node { ${fields} } } }`,
      async () => {
        created = (await createEvent(pubsub2)).createEvent;
      },
    );

    expect(event?.createdEvent.node).toEqual(created);
  });

  test.each([
    ['period: { start_gt: <04-01> }', `period: { start_gt: "${date('04-01')}" }`, true],
    ['period: { start_gt: <06-01> }', `period: { start_gt: "${date('06-01')}" }`, false],
    [
      'period: { reminder: { at_lt: <05-01> } }',
      `period: { reminder: { at_lt: "${date('05-01')}" } }`,
      true,
    ],
    [
      'period: { reminder: { at_gt: <05-01> } }',
      `period: { reminder: { at_gt: "${date('05-01')}" } }`,
      false,
    ],
    ['slots: { start_gte: <06-01> }', `slots: { start_gte: "${date('06-01')}" }`, true],
    ['slots: { start_gt: <07-01> }', `slots: { start_gt: "${date('07-01')}" }`, false],
    ['slots: { marks: <05-03> }', `slots: { marks: "${date('05-03')}" }`, true],
    ['slots: { marks: <05-04> }', `slots: { marks: "${date('05-04')}" }`, false],
    [
      'slots: { _index: 0, start: <05-01> }',
      `slots: { _index: 0, start: "${date('05-01')}" }`,
      true,
    ],
    [
      'slots: { _index: 1, start: <05-01> }',
      `slots: { _index: 1, start: "${date('05-01')}" }`,
      false,
    ],
  ])('should filter by "wherePayload" %s', async (label, wherePayload, delivered) => {
    const event = await firstEvent(
      pubsub2,
      `subscription { createdEvent(wherePayload: { ${wherePayload} }) { node { title } } }`,
      () => createEvent(pubsub2),
    );

    expect(event !== null).toBe(delivered);
  });

  test('should report a changed embedded date in "updatedFields" and "previousNode"', async () => {
    const { title } = (await createEvent(pubsub2)).createEvent;

    const event = await firstEvent(
      pubsub2,
      `subscription {
        updatedEvent(whichUpdated: { updatedFields_in: [period] }) {
          updatedFields
          previousNode { period { start } }
          node { period { start } }
        }
      }`,
      () =>
        run(
          'mutation ($title: String!, $period: PeriodUpdateInput) { updateEvent(whereOne: { title: $title }, data: { period: $period }) { id } }',
          pubsub2,
          {
            title,
            period: { start: date('05-10'), end: date('05-02'), reminder: { at: date('04-30') } },
          },
        ),
    );

    // as a client gets it: the "DateTime" scalar gives Dates, the transport makes strings of them
    expect(JSON.parse(JSON.stringify(event?.updatedEvent))).toEqual({
      updatedFields: ['period'],
      previousNode: { period: { start: date('05-01') } },
      node: { period: { start: date('05-10') } },
    });
  });

  test('should test both states of an update with an embedded date filter', async () => {
    const { title } = (await createEvent(pubsub2)).createEvent;

    const event = await firstEvent(
      pubsub2,
      `subscription { updatedEvent(wherePayload: { period: { start_gte: "${date('05-01')}" } }) { node { title } } }`,
      () =>
        run(
          'mutation ($title: String!, $slots: [SlotUpdateInput!]) { updateEvent(whereOne: { title: $title }, data: { slots: $slots }) { id } }',
          pubsub2,
          { title, slots: [{ room: 'C', start: date('07-01'), marks: [date('07-02')] }] },
        ),
    );

    expect(event?.updatedEvent.node).toEqual({ title });
  });
});
