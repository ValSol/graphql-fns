/* eslint-env jest */

import { TangibleEntityConfig, VirtualEntityConfig } from '@/tsTypes';
import composeReport from '.';

describe('composeReport', () => {
  const tokenConfig: VirtualEntityConfig = {
    name: 'Token',
    type: 'virtual',

    textFields: [{ name: 'userId', type: 'textFields' }],
  };

  const entityConfig: TangibleEntityConfig = {
    name: 'Person',
    type: 'tangible',

    subscriptionActorConfig: tokenConfig,

    textFields: [
      { name: 'firstName', type: 'textFields' },
      { name: 'lastName', type: 'textFields' },
    ],

    calculatedFields: [
      {
        name: 'userId',
        type: 'calculatedFields',
        calculatedType: 'textFields',
        func: (() => {}) as any,
      },
    ],
  };

  const publishArgs = { current: null };
  const context = {
    pubsub: {
      publish: (arg1: string, arg2: Record<string, any>) => {
        publishArgs.current = { arg1, arg2 };
      },
    },
  };

  const node = { firstName: 'John', lastName: 'Smith', userId: '1234567890' };

  test('created', () => {
    const about = 'created';

    composeReport(about, entityConfig, context, node);

    const expectedPublishArgs = {
      arg1: 'created-Person',
      arg2: {
        createdPerson: {
          actor: { userId: '1234567890' },
          node: { firstName: 'John', lastName: 'Smith', userId: '1234567890' },
        },
      },
    };

    expect(publishArgs.current).toEqual(expectedPublishArgs);
  });

  test('created', () => {
    const about = 'deleted';

    composeReport(about, entityConfig, context, node);

    const expectedPublishArgs = {
      arg1: 'deleted-Person',
      arg2: {
        deletedPerson: {
          actor: { userId: '1234567890' },
          node: { firstName: 'John', lastName: 'Smith', userId: '1234567890' },
        },
      },
    };

    expect(publishArgs.current).toEqual(expectedPublishArgs);
  });

  test('updated', () => {
    const about = 'updated';

    const previousNode = { firstName: 'John', lastName: 'Lennon', userId: '1234567890' };

    composeReport(about, entityConfig, context, node, previousNode);

    const expectedPublishArgs = {
      arg1: 'updated-Person',
      arg2: {
        updatedPerson: {
          actor: { userId: '1234567890' },
          node: { firstName: 'John', lastName: 'Smith', userId: '1234567890' },
          previousNode: { firstName: 'John', lastName: 'Lennon', userId: '1234567890' },
          updatedFields: ['lastName'],
        },
      },
    };

    expect(publishArgs.current).toEqual(expectedPublishArgs);
  });
});
