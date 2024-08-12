/* eslint-env jest */

import composeSpecificActionName from './composeSpecificActionName';

describe('composeSpecificActionName util', () => {
  const entityName = 'User';
  test('should return entities for User', () => {
    const actionName = 'entities';

    const expectedResult = 'Users';

    const result = composeSpecificActionName({ actionName, entityName });

    expect(result).toEqual(expectedResult);
  });

  test('should return entityCount for User', () => {
    const actionName = 'entityCount';

    const expectedResult = 'UserCount';

    const result = composeSpecificActionName({ actionName, entityName });

    expect(result).toEqual(expectedResult);
  });

  test('should return createEntity for User', () => {
    const actionName = 'createEntity';

    const expectedResult = 'createUser';

    const result = composeSpecificActionName({ actionName, entityName });

    expect(result).toEqual(expectedResult);
  });
});
