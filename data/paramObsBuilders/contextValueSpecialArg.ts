import { ComponentContext } from "@/views/view_builder/component"
import {
  ProcessorContext,
  ViewBuilderSpecialArg,
} from "@/views/view_builder/processSpecialArgs"
import { get } from "lodash-es"

export type ContextValue<ValueType extends any> =
  ViewBuilderSpecialArg<ValueType> & {
    _readonly: true
    _buildValue: (arg: ValueType, context: ProcessorContext) => ValueType
    _value: ValueType
  }

export const contextValueSpecialArg = <
  ValueType extends any,
  PropName extends keyof ComponentContext
>(
  propName: PropName,
  defaultValue: ValueType
): ContextValue<ValueType> => {
  const getValue = (lastValue: ValueType, context: ProcessorContext) => {
    const currentValue = get(context.context, propName) as ValueType
    return typeof currentValue === "undefined" ? defaultValue : currentValue
  }
  return {
    _readonly: true,
    _value: defaultValue,
    _buildValue: getValue,
    _skipArg: true,
  } as ContextValue<ValueType>
}
