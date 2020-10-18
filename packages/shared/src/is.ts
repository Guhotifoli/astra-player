const isArray = Array.isArray;

function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isSymbol(value: unknown): value is symbol {
  return typeof value === 'symbol';
}

function isObject(value: unknown): value is Record<any, any> {
  return value !== null && typeof value === 'object';
}

function isPlainObject(value: unknown): value is Object {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function isPromise<T = any>(value: unknown): value is Promise<T> {
  return isObject(value) && isFunction(value.catch) && isFunction(value.then);
}

function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

function isNotNullOrUndefined<T>(
  value: T
): value is Exclude<T, null | undefined> {
  return !isNullOrUndefined(value);
}

function isHTMLElement(el: unknown): el is HTMLElement {
  return Boolean(el && HTMLElement && el instanceof HTMLElement);
}

export const is = {
  isArray,
  isFunction,
  isString,
  isSymbol,
  isObject,
  isPlainObject,
  isPromise,
  isNullOrUndefined,
  isNotNullOrUndefined,
  isHTMLElement,
};
