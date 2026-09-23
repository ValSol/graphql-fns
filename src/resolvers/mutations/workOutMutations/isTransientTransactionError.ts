import hasErrorLabel from './hasErrorLabel';

const WRITE_CONFLICT_CODE = 112;

// only errors that mongodb marks as transient may succeed on a retry of the whole transaction
// ("UnknownTransactionCommitResult" is not among them: transaction may be already committed,
// so only "commitTransaction" has to be retried, see "commitTransactionWithRetry")
const isTransientTransactionError = (err: any): boolean => {
  if (!err || typeof err !== 'object') {
    return false;
  }

  if (hasErrorLabel(err, 'TransientTransactionError')) {
    return true;
  }

  const { code, codeName } = err;

  return code === WRITE_CONFLICT_CODE || codeName === 'WriteConflict';
};

export default isTransientTransactionError;
