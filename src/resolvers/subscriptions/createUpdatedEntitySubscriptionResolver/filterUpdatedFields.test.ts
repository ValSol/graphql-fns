/* eslint-env jest */

import filterUpdatedFields, { WhichUpdated } from './filterUpdatedFields';

describe('filterUpdatedFields util', () => {
  const updatedFields = ['firstName', 'secondName', 'updatedAt'];

  const subscriptionUpdatedFields = ['firstName', 'secondName', 'code'];

  test('whichUpdated: { updatedFields: "firstName" }', () => {
    const whichUpdated = { updatedFields: 'firstName' } as WhichUpdated;

    const result = filterUpdatedFields(updatedFields, subscriptionUpdatedFields, whichUpdated);

    const expectedResult = ['firstName', 'secondName'];

    expect(result).toEqual(expectedResult);
  });

  test('whichUpdated: { updatedFields: "code" }', () => {
    const whichUpdated = { updatedFields: 'code' } as WhichUpdated;

    const result = filterUpdatedFields(updatedFields, subscriptionUpdatedFields, whichUpdated);

    const expectedResult = [];

    expect(result).toEqual(expectedResult);
  });

  test('whichUpdated: { updatedFields_in: ["firstName"] }', () => {
    const whichUpdated = { updatedFields_in: ['firstName'] } as WhichUpdated;

    const result = filterUpdatedFields(updatedFields, subscriptionUpdatedFields, whichUpdated);

    const expectedResult = ['firstName', 'secondName'];

    expect(result).toEqual(expectedResult);
  });

  test('whichUpdated: { updatedFields_in: ["code"] }', () => {
    const whichUpdated = { updatedFields_in: ['code'] } as WhichUpdated;

    const result = filterUpdatedFields(updatedFields, subscriptionUpdatedFields, whichUpdated);

    const expectedResult = [];

    expect(result).toEqual(expectedResult);
  });

  test('whichUpdated: { updatedFields_nin: ["firstName"] }', () => {
    const whichUpdated = { updatedFields_nin: ['firstName'] } as WhichUpdated;

    const result = filterUpdatedFields(updatedFields, subscriptionUpdatedFields, whichUpdated);

    const expectedResult = [];

    expect(result).toEqual(expectedResult);
  });

  test('whichUpdated: { updatedFields_nin: ["code"] }', () => {
    const whichUpdated = { updatedFields_nin: ['code'] } as WhichUpdated;

    const result = filterUpdatedFields(updatedFields, subscriptionUpdatedFields, whichUpdated);

    const expectedResult = ['firstName', 'secondName'];

    expect(result).toEqual(expectedResult);
  });
});
