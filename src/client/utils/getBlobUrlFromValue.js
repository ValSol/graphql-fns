// @flow

const getHashFromValue = ({ tablet }: { tablet: string }): string =>
  tablet.slice(0, 5) === 'blob:' ? tablet : '';

export default getHashFromValue;
