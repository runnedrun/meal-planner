import { ParamaterizedObservable } from "@/data/ParamaterizedObservable"
import { prop } from "@/data/paramObsBuilders/prop"
import { component } from "@/views/view_builder/component"
import { isArray, sortBy } from "lodash-es"
import { AdminComboxBox, AutocompleteOptions } from "./AdminComboBox"

export const buildForeignKeySelector = <
  ValuesType extends { uid: string },
  ArgsType extends Record<string, any>,
  IsMultiselect extends boolean
>(
  optionsObs: ParamaterizedObservable<ArgsType, ValuesType[], any>,
  autocompleteOptions: AutocompleteOptions<ValuesType, IsMultiselect>
) =>
  component(
    () => ({
      possibleValues: optionsObs,
      value: prop(
        "value",
        null as IsMultiselect extends true ? ValuesType[] : ValuesType,
        true
      ),
      update: prop(
        "update",
        null as (
          v: IsMultiselect extends true ? ValuesType[] : ValuesType
        ) => void
      ),
    }),
    ({ possibleValues, value, update }) => {
      const valuesArray = isArray(value) ? value : [value]
      const getValue = (id: string) => {
        const a = [...possibleValues, ...valuesArray].find(
          (_) => _?.uid === id
        ) as any

        return a
      }

      const sortedPossibleValues = autocompleteOptions.sortOptions
        ? sortBy(possibleValues, autocompleteOptions.sortOptions)
        : possibleValues

      const options = sortedPossibleValues.map((_) => _.uid)

      return (
        <AdminComboxBox
          options={options}
          getIdFromValue={(_) => _ as string}
          getValueFromId={getValue}
          autocompleteOptions={autocompleteOptions as any}
          value={value}
          update={update}
        />
      )
    }
  )
