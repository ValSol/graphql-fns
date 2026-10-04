// an explicit iterator, not an async generator: "return" of a generator waits until its pending "next"
// is resolved, i.e. until the next event of the channel, so a closed subscription would stay subscribed
// to the PubSub till then; here "return" closes the source at once, while the calls of "next" are
// still queued as a generator does
function withFilterAndTransformer<TPayload, TTransformed = TPayload>(
  asyncIterable: AsyncIterable<TPayload>,
  filterFn: (payload: TPayload) => boolean | Promise<boolean> = () => true,
  transformFn: (payload: TPayload) => TTransformed | Promise<TTransformed> = (payload) =>
    payload as unknown as TTransformed,
): AsyncIterable<TTransformed> {
  return {
    [Symbol.asyncIterator]() {
      const iterator = asyncIterable[Symbol.asyncIterator]();

      const pull = async (): Promise<IteratorResult<TTransformed>> => {
        for (;;) {
          const { done, value } = await iterator.next();

          if (done) return { done: true, value: undefined };

          if (await filterFn(value)) {
            return { done: false, value: await transformFn(value) };
          }
        }
      };

      let queue: Promise<unknown> = Promise.resolve();

      const result: AsyncIterableIterator<TTransformed> = {
        next() {
          const nextResult = queue.then(pull);

          queue = nextResult.catch(() => undefined);

          return nextResult;
        },

        async return() {
          await iterator.return?.();

          return { done: true, value: undefined };
        },

        async throw(error) {
          await iterator.return?.();

          throw error;
        },

        [Symbol.asyncIterator]() {
          return result;
        },
      };

      return result;
    },
  };
}

export default withFilterAndTransformer;
