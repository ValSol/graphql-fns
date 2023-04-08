const sleep = (msec: number): Promise<void> => new Promise((resolve: (result: Promise<undefined> | undefined) => void) => setTimeout(resolve, msec));

export default sleep;
