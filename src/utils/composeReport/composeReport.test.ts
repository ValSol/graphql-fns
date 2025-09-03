/* eslint-env jest */

import composeReport from '.';

describe('composeReport', () => {
  const publishArgs = { current: null };
  const context = {
    pubsub: {
      publish: (arg1: string, arg2: Record<string, any>) => {
        publishArgs.current = { arg1, arg2 };
      },
    },
  };

  const name = 'Person';
  const node = { firstName: 'John', lastName: 'Smith' };

  test('created', () => {
    const about = 'created';

    composeReport(about, name, context, node);

    const expectedPublishArgs = {
      arg1: 'created-Person',
      arg2: { createdPerson: { firstName: 'John', lastName: 'Smith' } },
    };

    expect(publishArgs.current).toEqual(expectedPublishArgs);
  });

  test('created', () => {
    const about = 'deleted';

    composeReport(about, name, context, node);

    const expectedPublishArgs = {
      arg1: 'deleted-Person',
      arg2: { deletedPerson: { firstName: 'John', lastName: 'Smith' } },
    };

    expect(publishArgs.current).toEqual(expectedPublishArgs);
  });

  test('updated', () => {
    const about = 'updated';

    const previousNode = { firstName: 'John', lastName: 'Lennon' };

    composeReport(about, name, context, node, previousNode);

    const expectedPublishArgs = {
      arg1: 'updated-Person',
      arg2: {
        updatedPerson: {
          node: { firstName: 'John', lastName: 'Smith' },
          previousNode: { firstName: 'John', lastName: 'Lennon' },
          updatedFields: ['lastName'],
        },
      },
    };

    expect(publishArgs.current).toEqual(expectedPublishArgs);
  });
});
