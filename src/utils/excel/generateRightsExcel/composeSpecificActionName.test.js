// @flow
/* eslint-env jest */

import composeSpecificActionName from './composeSpecificActionName';

describe('composeSpecificActionName util', () => {
  const thingName = 'User';
  test('should return things for User', () => {
    const actionName = 'things';

    const expectedResult = 'Users';

    const result = composeSpecificActionName({ actionName, thingName });

    expect(result).toEqual(expectedResult);
  });

  test('should return thingCount for User', () => {
    const actionName = 'thingCount';

    const expectedResult = 'UserCount';

    const result = composeSpecificActionName({ actionName, thingName });

    expect(result).toEqual(expectedResult);
  });

  test('should return importThings for User', () => {
    const actionName = 'importThings';

    const expectedResult = 'importUsers';

    const result = composeSpecificActionName({ actionName, thingName });

    expect(result).toEqual(expectedResult);
  });

  test('should return createThing for User', () => {
    const actionName = 'createThing';

    const expectedResult = 'createUser';

    const result = composeSpecificActionName({ actionName, thingName });

    expect(result).toEqual(expectedResult);
  });
});
