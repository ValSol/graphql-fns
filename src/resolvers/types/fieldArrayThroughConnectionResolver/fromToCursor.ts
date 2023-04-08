const toCursor = (shift: number): string => Buffer.from(`${shift}`, 'binary').toString('base64');

const fromCursor = (cursor: string): number =>
  parseInt(Buffer.from(cursor, 'base64').toString('binary'), 10);

export { fromCursor, toCursor };
