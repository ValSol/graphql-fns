// @flow

const sleep = (msec: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, msec));

export default sleep;
