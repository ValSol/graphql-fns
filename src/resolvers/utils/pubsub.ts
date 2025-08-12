import { createPubSub } from '@graphql-yoga/subscription';

export type PubSubChannels = Record<string, [text: string]>;

const pubsub = createPubSub<PubSubChannels>();

export default pubsub;
