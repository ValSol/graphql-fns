import sleep from '@/utils/sleep';
import hasErrorLabel from './hasErrorLabel';

// repeated "commitTransaction" of the same transaction is safe: if the transaction was already
// committed server responds with success, so whole transaction is not executed twice
const commitTransactionWithRetry = async (session: any, tryCount: number): Promise<void> => {
  for (let i = 0; i < tryCount; i += 1) {
    try {
      await session.commitTransaction();

      return;
    } catch (err) {
      if (i === tryCount - 1 || !hasErrorLabel(err, 'UnknownTransactionCommitResult')) {
        throw err;
      }

      await sleep(100 * 2 ** i);
    }
  }
};

export default commitTransactionWithRetry;
