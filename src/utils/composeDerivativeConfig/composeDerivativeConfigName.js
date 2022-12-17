// @flow

const composeDerivativeConfigName = (
  name: string,
  derivativeKey: string,
  slicePosition?: number,
): string =>
  typeof slicePosition === 'number'
    ? `${name.slice(0, slicePosition)}${derivativeKey}${name.slice(slicePosition)}`
    : `${name}${derivativeKey}`;

export default composeDerivativeConfigName;
