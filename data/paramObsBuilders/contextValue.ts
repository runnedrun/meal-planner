import { ComponentContext } from "@/views/view_builder/component"
import { map } from "rxjs"
import { contextValueSpecialArg } from "./contextValueSpecialArg"
import { settable } from "./settable"

export const contextValue = <NameType extends keyof ComponentContext>(
  name: NameType,
  defaultValue?: ComponentContext[NameType]
) => {
  return settable(name, contextValueSpecialArg(name, defaultValue)).pipe(
    map((_) => _._value)
  )
}
