// like "Promise.all(items.map(func))" but "func" runs for at most "concurrency" items at once ...
// ... (the results keep the order of "items"; after the first error no new item is started)
const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  func: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);

  let nextIndex = 0;
  let failed = false;

  const worker = async () => {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;

      try {
        results[index] = await func(items[index], index);
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);

  await Promise.all(workers);

  return results;
};

export default mapWithConcurrency;
