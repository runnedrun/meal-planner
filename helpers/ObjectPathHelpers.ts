import { CountdownType } from "./countdownType"

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never

export type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], CountdownType[D]>>
        : never
    }[keyof T]
  : ""

export type PropertyPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? T[K] extends Function
          ? never
          : `${K}` | Join<K, PropertyPaths<T[K], CountdownType[D]>>
        : never
    }[keyof T]
  : ""

type Idx<T, K> = K extends keyof T
  ? T[K]
  : number extends keyof T
  ? K extends `${number}`
    ? T[number]
    : never
  : never

export type PathValue<
  T,
  P extends string
> = P extends `${infer Key}.${infer Rest}`
  ? Rest extends Paths<Idx<T, Key>, 2>
    ? PathValue<Idx<T, Key>, Rest>
    : never
  : Idx<T, P>

// export type DeepValue<
//   T,
//   P extends string
// > = P extends `${infer K}.${infer Rest}`
//   ? T[(K extends `${infer R extends number}` ? R : K) & keyof T] extends infer S
//     ? S extends never // make S distributive to work with union object
//       ? never
//       : Rest extends string
//       ? DeepValue<S, Rest>
//       : never // impossible route
//     : never // impossible route
//   : T[(P extends `${infer R extends number}` ? R : P) & keyof T]

// type P = {
//   y: 1
//   o: {
//     w: {
//       h: "asdf"
//     }
//   }
// }

// type i = Paths<P>
// type q = PathValue<P, "o.w">
