/* eslint-env jest */

import resolvedInfo1 from './resolvedInfo1.json';
import resolvedInfo2 from './resolvedInfo2.json';
import resolvedInfo3 from './resolvedInfo3.json';
import resolvedInfo4 from './resolvedInfo4.json';

import getSimpleProjectionFromResolvedInfo from './getSimpleProjectionFromResolvedInfo';

describe('getSimpleProjectionFromResolvedInfo', () => {
  test('resolvedInfo1', () => {
    const result = getSimpleProjectionFromResolvedInfo(resolvedInfo1 as any, []);

    const expectedResult = {
      closedAt: 1,
      ownPostsCount: 1,
      ownPosts: 1,
      ownRestaurantsCount: 1,
      ownRestaurants: 1,
      kinds: 1,
      brandExcerpt: 1,
      organizationExcerpt: 1,
      ukTitle: 1,
      ukFullTitle: 1,
      ukAddress: 1,
      ukAddressInfo: 1,
      logo: 1,
      photoHeader: 1,
      servicePackage: 1,
      slug: 1,
      tels: 1,
      ukDescription: 1,
      socialAccounts: 1,
      websites: 1,
      workDays: 1,
      coordinates: 1,
      photosCount: 1,
      photos: 1,
    };

    expect(result).toEqual(expectedResult);
  });

  test('resolvedInfo2', () => {
    const result = getSimpleProjectionFromResolvedInfo(resolvedInfo2 as any, ['edges', 'node']);

    const expectedResult = {
      ukTitle: 1,
      ukSummary: 1,
      photoHeader: 1,
      slug: 1,
      startAt: 1,
      endAt: 1,
    };

    expect(result).toEqual(expectedResult);
  });

  test('resolvedInfo3', () => {
    const result = getSimpleProjectionFromResolvedInfo(resolvedInfo3 as any, ['edges', 'node']);

    const expectedResult = {
      cuisines: 1,
      kinds: 1,
      workDays: 1,
      ukTitle: 1,
      logo: 1,
      photoHeader: 1,
      servicePackage: 1,
      tels: 1,
      slug: 1,
    };

    expect(result).toEqual(expectedResult);
  });

  test('resolvedInfo4', () => {
    const result = getSimpleProjectionFromResolvedInfo(resolvedInfo4 as any, []);

    const expectedResult = {
      name: 1,
      picture: 1,
      roles: 1,
      firstName: 1,
      lastName: 1,
      tels: 1,
      coordinates: 1,
    };

    expect(result).toEqual(expectedResult);
  });
});
