import mapWithConcurrency from './mapWithConcurrency';
import sleep from './sleep';

describe('mapWithConcurrency', () => {
  test('should keep the order of items and run at most "concurrency" items at once', async () => {
    let running = 0;
    let maxRunning = 0;

    const items = [30, 10, 20, 5, 15, 25, 0];

    const result = await mapWithConcurrency(items, 3, async (item, index) => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);

      await sleep(item);

      running -= 1;

      return `${index}:${item}`;
    });

    expect(result).toEqual(['0:30', '1:10', '2:20', '3:5', '4:15', '5:25', '6:0']);
    expect(maxRunning).toBe(3);
  });

  test('should run all items at once if "concurrency" exceeds their number', async () => {
    let running = 0;
    let maxRunning = 0;

    const result = await mapWithConcurrency([1, 2], 10, async (item) => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);

      await sleep(5);

      running -= 1;

      return item * 2;
    });

    expect(result).toEqual([2, 4]);
    expect(maxRunning).toBe(2);
  });

  test('should return empty array for empty items', async () => {
    const func = jest.fn();

    const result = await mapWithConcurrency([], 10, func);

    expect(result).toEqual([]);
    expect(func).not.toHaveBeenCalled();
  });

  test('should reject with the first error and not start new items after it', async () => {
    const started: number[] = [];

    const promise = mapWithConcurrency([0, 1, 2, 3, 4], 2, async (item) => {
      started.push(item);

      await sleep(5);

      if (item === 1) throw new TypeError('Failed item 1!');

      return item;
    });

    await expect(promise).rejects.toThrow('Failed item 1!');

    await sleep(30);

    expect(started).toEqual([0, 1, 2]);
  });
});
