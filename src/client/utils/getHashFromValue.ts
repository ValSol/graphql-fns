const getHashFromValue = (
  {
    desktop,
  }: {
    desktop: string
  },
): string => desktop.slice(0, 5) === 'blob:' ? desktop.split('#')[1] : '';

export default getHashFromValue;
