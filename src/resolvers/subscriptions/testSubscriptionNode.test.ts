import { Types } from 'mongoose';

import type { SimplifiedEntityConfig } from '@/tsTypes';

import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import testSubscriptionNode from './testSubscriptionNode';

describe('testSubscriptionNode', () => {
  const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
    { name: 'Tag', type: 'embedded', textFields: [{ name: 'label' }] },
    { name: 'Summary', type: 'virtual', textFields: [{ name: 'text' }] },
    {
      name: 'Doc',
      textFields: [{ name: 'title' }],
      calculatedFields: [
        {
          name: 'mainTag',
          calculatedType: 'embeddedFields',
          configName: 'Tag',
        } as any,
        {
          name: 'summary',
          calculatedType: 'virtualFields',
          configName: 'Summary',
        } as any,
      ],
    },
  ];

  const { Doc: entityConfig } = composeAllEntityConfigs(simplifiedEntityConfigs);

  test('should filter by calculated embedded field', () => {
    const node = { title: 'x', mainTag: { label: 'news' }, summary: { text: 'short' } };

    expect(
      testSubscriptionNode([node], { mainTag: { label: 'news' } }, {} as any, entityConfig),
    ).toBe(true);

    expect(
      testSubscriptionNode([node], { mainTag: { label: 'sport' } }, {} as any, entityConfig),
    ).toBe(false);
  });

  describe('relational fields', () => {
    const { Ticket: ticketConfig } = composeAllEntityConfigs([
      { name: 'Person', textFields: [{ name: 'name' }] },
      {
        name: 'Ticket',
        relationalFields: [
          { name: 'owner', configName: 'Person', oppositeName: 'ownTickets' },
          { name: 'watchers', configName: 'Person', oppositeName: 'watchedTickets', array: true },
        ],
      },
    ]);

    const owner = new Types.ObjectId();
    const watcher = new Types.ObjectId();
    const other = new Types.ObjectId();

    // an in-memory PubSub publishes the ids of relational fields as ObjectIds,
    // a serializing one (JSON, Redis) as strings: both have to match the same filters
    const nodes = {
      'ObjectIds (in-memory PubSub)': { owner, watchers: [watcher] },
      'strings (serializing PubSub)': { owner: String(owner), watchers: [String(watcher)] },
    };

    Object.entries(nodes).forEach(([kind, node]) => {
      test(`should filter by relational fields holding ${kind} with "wherePayload"`, () => {
        const check = (wherePayload: Record<string, any>) =>
          testSubscriptionNode([node], wherePayload, {} as any, ticketConfig);

        expect(check({ owner: String(owner) })).toBe(true);
        expect(check({ owner: String(other) })).toBe(false);
        expect(check({ owner_in: [String(other), String(owner)] })).toBe(true);
        expect(check({ owner_nin: [String(owner)] })).toBe(false);
        expect(check({ watchers: String(watcher) })).toBe(true);
        expect(check({ watchers: String(other) })).toBe(false);
      });

      test(`should filter by relational fields holding ${kind} with payload filter`, () => {
        const check = (filter: Record<string, any>) =>
          testSubscriptionNode([node], {}, filter as any, ticketConfig);

        expect(check({ owner: { $eq: String(owner) } })).toBe(true);
        expect(check({ owner: { $eq: String(other) } })).toBe(false);
        expect(check({ watchers: { $eq: String(watcher) } })).toBe(true);
      });
    });
  });

  describe('dates', () => {
    const { Event: eventConfig } = composeAllEntityConfigs([
      { name: 'Slot', type: 'embedded', dateTimeFields: [{ name: 'start' }] },
      {
        name: 'Event',
        dateTimeFields: [{ name: 'startsAt' }, { name: 'reminders', array: true }],
        embeddedFields: [{ name: 'slots', configName: 'Slot', array: true }],
        calculatedFields: [
          { name: 'endsAt', calculatedType: 'dateTimeFields' } as any,
          { name: 'mainSlot', calculatedType: 'embeddedFields', configName: 'Slot' } as any,
        ],
      },
    ]);

    const date = new Date('2026-05-01T10:00:00.000Z');
    const before = new Date('2026-04-01T00:00:00.000Z');
    const after = new Date('2026-06-01T00:00:00.000Z');

    // an in-memory PubSub publishes the dates as Dates, a serializing one (JSON, Redis) as strings,
    // while "wherePayload" gets Dates from the "DateTime" scalar
    const nodes = {
      'Dates (in-memory PubSub)': {
        createdAt: date,
        startsAt: date,
        reminders: [date],
        endsAt: date,
        slots: [{ start: date }],
        mainSlot: { start: date },
      },
      'strings (serializing PubSub)': JSON.parse(
        JSON.stringify({
          createdAt: date,
          startsAt: date,
          reminders: [date],
          endsAt: date,
          slots: [{ start: date }],
          mainSlot: { start: date },
        }),
      ),
    };

    Object.entries(nodes).forEach(([kind, node]) => {
      test(`should filter by date fields holding ${kind} with "wherePayload"`, () => {
        const check = (wherePayload: Record<string, any>) =>
          testSubscriptionNode([node], wherePayload, {} as any, eventConfig);

        expect(check({ createdAt_gt: before })).toBe(true);
        expect(check({ createdAt_gt: after })).toBe(false);
        expect(check({ startsAt: date })).toBe(true);
        expect(check({ startsAt_lt: before })).toBe(false);
        expect(check({ reminders: date })).toBe(true);
        expect(check({ endsAt_gte: date })).toBe(true);
        expect(check({ endsAt_gt: date })).toBe(false);
        expect(check({ mainSlot: { start: date } })).toBe(true);
        expect(check({ mainSlot: { start: after } })).toBe(false);
      });

      test(`should filter by date fields holding ${kind} with payload filter`, () => {
        const check = (filter: Record<string, any>) =>
          testSubscriptionNode([node], {}, filter as any, eventConfig);

        expect(check({ updatedAt: { $exists: false } })).toBe(true);
        expect(check({ startsAt: { $gt: before } })).toBe(true);
        expect(check({ 'slots.start': { $lt: after } })).toBe(true);
        expect(check({ 'slots.start': { $gt: after } })).toBe(false);
      });
    });
  });
});
