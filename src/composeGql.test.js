// @flow
/* eslint-env jest */
const composeGql = require('./composeGql');

describe('composeGql graphql util', () => {
  test('should return users', () => {
    const name = 'users';
    const fields = { userId: null };
    const expectedResult = `
query usersQuery {
  users {
    userId
  }
}
`;
    const result = composeGql(name, fields);
    expect(result).toBe(expectedResult);
  });

  test('should return users with new operationName', () => {
    const name = 'users';
    const fields = { userId: null };
    const options = { operationName: 'usersTestQuery' };
    const expectedResult = `
query usersTestQuery {
  users {
    userId
  }
}
`;
    const result = composeGql(name, fields, options);
    expect(result).toBe(expectedResult);
  });

  test('should return recoverUsers mutation', () => {
    const name = 'recoverUsers';
    const fields = { userId: null };
    const options = { isMutation: true };
    const expectedResult = `
mutation recoverUsersMutation {
  recoverUsers {
    userId
  }
}
`;
    const result = composeGql(name, fields, options);
    expect(result).toBe(expectedResult);
  });

  test('should return user query with args', () => {
    const name = 'user';
    const fields = { userId: null };
    const args = [{ name: 'userId', type: 'ID!' }];
    const options = { args };
    const expectedResult = `
query userQuery($userId: ID!) {
  user(userId: $userId) {
    userId
  }
}
`;
    const result = composeGql(name, fields, options);
    expect(result).toBe(expectedResult);
  });

  test('should return removeUser mutation with args', () => {
    const name = 'removeUser';
    const fields = { userId: null };
    const args = [{ name: 'userId', type: 'ID!' }];
    const isMutation = true;
    const options = { args, isMutation };
    const expectedResult = `
mutation removeUserMutation($userId: ID!) {
  removeUser(userId: $userId) {
    userId
  }
}
`;
    const result = composeGql(name, fields, options);
    expect(result).toBe(expectedResult);
  });

  test('should return blogs query with args and argsForDirectives', () => {
    const name = 'blogs';
    const fields = {
      'title_uk @include(if: $uk)': null,
      'title_en @include(if: $en)': null,
    };
    const args = [{ name: 'blogId', type: 'ID!' }];
    const argsForDirectives = [{ name: 'uk', type: 'Boolean!' }, { name: 'en', type: 'Boolean!' }];
    const options = { args, argsForDirectives };
    const expectedResult = `
query blogsQuery($blogId: ID!, $uk: Boolean!, $en: Boolean!) {
  blogs(blogId: $blogId) {
    title_uk @include(if: $uk)
    title_en @include(if: $en)
  }
}
`;
    const result = composeGql(name, fields, options);
    expect(result).toBe(expectedResult);
  });

  test('should return user query with arg value', () => {
    const name = 'user';
    const fields = { userId: null };
    const args = [{ name: 'userId', value: '"12345"' }];
    const options = { args };
    const expectedResult = `
query userQuery {
  user(userId: "12345") {
    userId
  }
}
`;
    const result = composeGql(name, fields, options);
    expect(result).toBe(expectedResult);
  });
});
