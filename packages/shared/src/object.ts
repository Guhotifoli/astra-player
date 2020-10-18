import { is } from './is';

export function merge<
  T extends { [key: string]: any },
  U extends { [key: string]: any }
>(target: T, ...sources: U[]): { [key: string]: any } {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (!is.isObject(source)) {
    return target;
  }

  Object.keys(source).forEach((key) => {
    if (is.isObject(source[key])) {
      if (!Object.keys(target).includes(key)) {
        Object.assign(target, { [key]: {} });
      }

      merge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  });

  return merge(target, ...sources);
}

export function findByName(
  collection: any[],
  { name }: { name: string }
): Object {
  return collection.filter((coll) => {
    return coll?.name === name
  })[0];
}

export function swap<T>(array: T[], fIndex = 0, sIndex = 1) {
  return ([array[fIndex], array[sIndex]] = [array[sIndex], array[fIndex]]);
}
