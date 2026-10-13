const DUPLICATE_KEY_CODES = [11000, 11001];

// error of unique index violation (also inside errors of bulk write)
const isDuplicateKeyError = (err: any): boolean => {
  if (!err || typeof err !== 'object') {
    return false;
  }

  if (DUPLICATE_KEY_CODES.includes(err.code)) {
    return true;
  }

  const { writeErrors } = err;

  return (
    Array.isArray(writeErrors) &&
    writeErrors.some((writeError) => DUPLICATE_KEY_CODES.includes(writeError?.code))
  );
};

export default isDuplicateKeyError;
