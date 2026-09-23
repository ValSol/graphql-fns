const hasErrorLabel = (err: any, label: string): boolean =>
  Boolean(err) && Array.isArray(err.errorLabels) && err.errorLabels.includes(label);

export default hasErrorLabel;
