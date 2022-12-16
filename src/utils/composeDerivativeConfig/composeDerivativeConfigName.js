// @flow

const composeDerivativeConfigName = (
  name: string,
  suffix: string,
  slicePosition?: number,
): string =>
  typeof slicePosition === 'number'
    ? `${name.slice(0, slicePosition)}${suffix}${name.slice(slicePosition)}`
    : `${name}${suffix}`;

export default composeDerivativeConfigName;
