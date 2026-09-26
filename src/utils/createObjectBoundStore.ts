// the same object is used as a key instead of "undefined" (e.g. for not set "serversideConfig")
const undefinedKey = {};

// create cache that keeps separate store for every combination of key objects (e.g. "generalConfig"...
// ... & "serversideConfig"), so results composed for different configs are not mixed up;...
// ... "WeakMap" is used to not prevent garbage collection of not used configs
const createObjectBoundStore = <T = any>() => {
  const root = new WeakMap<object, any>();

  return (...keys: Array<object | undefined>): Record<string, T> => {
    let current = root;

    keys.forEach((key, i) => {
      const key2 = key || undefinedKey;

      if (!current.has(key2)) {
        current.set(key2, i === keys.length - 1 ? Object.create(null) : new WeakMap());
      }

      current = current.get(key2);
    });

    return current as unknown as Record<string, T>;
  };
};

export default createObjectBoundStore;
