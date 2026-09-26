/* eslint-env jest */
import createObjectBoundStore from './createObjectBoundStore';

describe('createObjectBoundStore', () => {
  test('should return separate stores for different key objects', () => {
    const getStore = createObjectBoundStore();

    const config1 = {};
    const config2 = {};

    getStore(config1).item = 1;
    getStore(config2).item = 2;

    expect(getStore(config1).item).toBe(1);
    expect(getStore(config2).item).toBe(2);
  });

  test('should return separate stores for combinations of key objects & "undefined"', () => {
    const getStore = createObjectBoundStore();

    const config = {};
    const serversideConfig = {};

    getStore(config, serversideConfig).item = 1;
    getStore(config, undefined).item = 2;

    expect(getStore(config, serversideConfig).item).toBe(1);
    expect(getStore(config, undefined).item).toBe(2);
    expect(getStore(config, {}).item).toBeUndefined();
  });
});
