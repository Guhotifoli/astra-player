import { ParamType, FilterKeys } from './mapped-types';
/**
 * @example
 * ```
 * type EventProps = {
 *   test: () => void;
 *   foo: (a: number) => void;
 * };
 * type EventKeys = EventKey<EventProps>;  // Expect: "test" | "foo"
 * ```
 */
export type EventKey<T> = FilterKeys<T, (...args: any[]) => any> & string;

/**
 * @example
 * ```
 * type EventProps = {
 *   test: () => void;
 *   foo: (a: number) => void;
 * };
 * type ListenerFunc = Listener<EventProps>; // Expect: (...args: [] | [a: number]) => any
 * ```
 */
export type Listener<T, K extends EventKey<T> = EventKey<T>> = (
  ...args: ParamType<T[K]>
) => any;

/**
 * @example
 * ```
 * type EventProps = {
 *   test: () => void;
 *   foo: (a: number) => void;
 * };
 * type ListenerFuncList = Listener<EventProps>; // Expect: Array<(...args: [] | [a: number]) => any>
 * ```
 */
export type ListenerList<T, K extends EventKey<T> = EventKey<T>> = Array<
  Listener<T, K>
>;

/**
 * @example
 * ```
 * type AttachKey = 'play' | 'seeked'
 * type AttachEventListenerMap = ExtractFnTypeFromKeyMap<
 *   HTMLMediaElementEventMap,
 *    AttachKey
 * > // Expect: { play: (ev?: Event | undefined) => void; seeked: (ev?: Event | undefined) => void; }
 * ```
 */
export type ExtractFnTypeFromKeyMap<T, K> = {
  [P in Extract<keyof T, K>]: (ev?: T[P]) => void;
};

/**
 * @example
 * const Map = { create: 'create' } as const
 * type CustomEventListenerMap = CreateNOOPTypeFromKeyMa<typeof Map> // Expect: { create: () => void }
 */
export type CreateNOOPTypeFromKeyMap<K> = {
  [P in keyof K]: () => void;
};
