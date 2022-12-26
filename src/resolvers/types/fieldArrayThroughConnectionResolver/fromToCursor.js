// @flow

const toCursor = (shift: number): string => btoa(`${shift}`);

const fromCursor = (cursor: string): number => parseInt(atob(cursor), 10);

export { fromCursor, toCursor };
