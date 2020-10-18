/**
 * @example
 * ```
 * type Props = {
 *   name: string;
 *   test: () => void;
 *   foo: (a: number) => void;
 * };
 * type Keys = FilterKeys<Props, (...args: any[]) => any>;  // Expect: "test" | "foo"
 * ```
 */
export type FilterKeys<T, Cond, U extends keyof T = keyof T> = {
  [K in U]: T[K] extends Cond ? K : never;
}[U];

/**
 * @example
 * ```
 * type Func = (a: number, b: string) => void
 * type Params = ParamType<Func>; // Expect: [a: number, b: string]
 * ```
 */
export type ParamType<T> = T extends (...args: infer P) => any ? P : [];

/**
 * @example
 * ```
 * class A {}
 * function factory(Ctor: ConstructorType<A>){
 *   return new Ctor();
 * }
 * ```
 */
export type ConstructorType<T> = new (...args: any[]) => T;

/**
 * @example
 * ```
 * type Props = {
 *   req: number;
 *   reqUndef: number | undefined;
 *   opt?: string;
 *   optUndef?: number | undefined;
 * };
 * type Keys = OptionalKeys<Props>; // Expect: "opt" | "optUndef"
 * ```
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * @example
 * ```
 * type Prop = string
 * type Nullable = NullableProp<Prop>; // Expect: string | null
 * ```
 */
export type NullableProp<T> = T | null;

/**
 * @example
 * const foo = { aa: 'aa', bb: 'bb' } as const
 * type Values = PickValues<typeof foo> // Expect: 'aa' | 'bb'
 */
export type PickValues<T extends object> = T[keyof T];
