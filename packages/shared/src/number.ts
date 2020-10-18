/**
 * @description parse boolean to number
 * @example true -> 1, false -> 0
 * @param bool
 * @returns {nubmer}
 */
export function parseBool2Num(bool: boolean): number {
  return ((bool as any) + 1) >> 1;
}
