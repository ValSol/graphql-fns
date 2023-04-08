const toCursor = (_id: string, shift: number): string =>
  Buffer.from(`${_id}:${shift}`, 'binary').toString('base64');

export default toCursor;
