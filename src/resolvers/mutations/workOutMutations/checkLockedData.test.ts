import type { TangibleEntityConfig } from '@/tsTypes';

import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import checkLockedData from './checkLockedData';

jest.mock('@/resolvers/utils/composeQueryResolver', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const composeQueryResolverMock = composeQueryResolver as jest.Mock;

const entityConfig: TangibleEntityConfig = {
  name: 'Example',
  type: 'tangible',
  textFields: [{ name: 'name', type: 'textFields' }],
};

const commonResolverCreatorArg = {
  generalConfig: { allEntityConfigs: { Example: entityConfig } },
  serversideConfig: {},
  context: {},
};

describe('checkLockedData', () => {
  const session = { id: 'session' };

  test('should read locked data inside transaction for array result', async () => {
    const queryResolver = jest.fn(async (...args: any[]) => [{ name: 'A' }, { name: 'B' }]);
    composeQueryResolverMock.mockReturnValue(queryResolver);

    await checkLockedData(
      {
        actionGeneralName: 'updateManyEntities',
        entityConfig,
        args: {},
        returnResult: false,
        lockedData: { args: { where: {} }, result: [{ name: 'A' }, { name: 'B' }] },
      },
      commonResolverCreatorArg,
      session,
    );

    expect(composeQueryResolverMock).toHaveBeenCalledWith('Examples', expect.anything(), {});
    expect(queryResolver.mock.calls[0][5]).toBe(session);
  });

  test('should read locked data inside transaction for scalar result', async () => {
    const queryResolver = jest.fn(async (...args: any[]) => ({ name: 'A' }));
    composeQueryResolverMock.mockReturnValue(queryResolver);

    await checkLockedData(
      {
        actionGeneralName: 'updateEntity',
        entityConfig,
        args: {},
        returnResult: false,
        lockedData: { args: { whereOne: { id: '1' } }, result: { name: 'A' } },
      },
      commonResolverCreatorArg,
      session,
    );

    expect(composeQueryResolverMock).toHaveBeenCalledWith('Example', expect.anything(), {});
    expect(queryResolver.mock.calls[0][5]).toBe(session);
  });

  test('should throw if locked array data was changed', async () => {
    composeQueryResolverMock.mockReturnValue(async () => [{ name: 'A' }, { name: 'C' }]);

    await expect(
      checkLockedData(
        {
          actionGeneralName: 'updateManyEntities',
          entityConfig,
          args: {},
          returnResult: false,
          lockedData: { args: { where: {} }, result: [{ name: 'A' }, { name: 'B' }] },
        },
        commonResolverCreatorArg,
        session,
      ),
    ).rejects.toThrow('Got current result.name = "C", but have to be "B"!');
  });
});
