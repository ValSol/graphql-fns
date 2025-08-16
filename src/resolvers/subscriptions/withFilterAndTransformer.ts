function withFilterAndTransformer<TPayload, TTransformed = TPayload>(
  asyncIterable: AsyncIterable<TPayload>,
  filterFn: (payload: TPayload) => boolean | Promise<boolean> = () => true,
  transformFn: (payload: TPayload) => TTransformed | Promise<TTransformed> = (payload) =>
    payload as unknown as TTransformed,
): AsyncIterable<TTransformed> {
  return {
    async *[Symbol.asyncIterator]() {
      for await (const value of asyncIterable) {
        if (await filterFn(value)) {
          yield await transformFn(value);
        }
      }
    },
  };
}

export default withFilterAndTransformer;
