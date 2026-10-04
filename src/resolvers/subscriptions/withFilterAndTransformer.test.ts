import { createPubSub } from '@graphql-yoga/subscription';

import withFilterAndTransformer from './withFilterAndTransformer';

type Payload = { n: number };

// an event target that counts its listeners
const createCountingEventTarget = () => {
  const target = new EventTarget();
  let listeners = 0;

  return {
    eventTarget: {
      addEventListener: (...args: Parameters<EventTarget['addEventListener']>) => {
        listeners += 1;
        target.addEventListener(...args);
      },
      removeEventListener: (...args: Parameters<EventTarget['removeEventListener']>) => {
        listeners -= 1;
        target.removeEventListener(...args);
      },
      dispatchEvent: (event: Event) => target.dispatchEvent(event),
    },
    getListeners: () => listeners,
  };
};

describe('withFilterAndTransformer', () => {
  test('should filter and transform the payloads', async () => {
    const pubsub = createPubSub<{ topic: [Payload] }>();

    const iterator = withFilterAndTransformer(
      pubsub.subscribe('topic'),
      ({ n }) => n % 2 === 0,
      ({ n }) => `#${n}`,
    )[Symbol.asyncIterator]();

    const first = iterator.next();
    const second = iterator.next().then(async (result) => result);

    // the subscription to the event target starts with the first "next"
    await new Promise((resolve) => setTimeout(resolve, 0));
    [1, 2, 3, 4].forEach((n) => pubsub.publish('topic', { n }));

    expect(await first).toEqual({ done: false, value: '#2' });
    expect(await second).toEqual({ done: false, value: '#4' });

    await iterator.return?.();
  });

  test('should unsubscribe from the PubSub at once when closed while waiting for an event', async () => {
    const { eventTarget, getListeners } = createCountingEventTarget();
    const pubsub = createPubSub<{ topic: [Payload] }>({ eventTarget: eventTarget as any });

    const iterator = withFilterAndTransformer(pubsub.subscribe('topic'))[Symbol.asyncIterator]();

    // a client subscribed and waits for an event
    const pending = iterator.next();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(getListeners()).toBe(1);

    // the client disconnects before any event of the channel is published
    await expect(iterator.return?.()).resolves.toEqual({ done: true, value: undefined });

    expect(getListeners()).toBe(0);
    await expect(pending).resolves.toEqual({ done: true, value: undefined });
  });
});
