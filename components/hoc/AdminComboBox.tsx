import { Box, Chip, TextField } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { isArray, isEqual, isUndefined } from "lodash-es"
import { isUndefinedOrNull } from "@/helpers/isUndefinedOrNull"

import { SingleFieldEditableProps } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { useFieldDisplayAutofocus } from "./useFieldDisplayAutofocus"
import { GetArrayOrValueType } from "@/helpers/getArrayOrValueType"
import React from "react"

export type AutocompleteOptions<OptionType, IsMultiselect extends boolean> = {
  renderOption?: (value: OptionType) => React.ReactNode
  renderLabel: (value: OptionType) => string
  inputLabel?: string
  multiSelect?: IsMultiselect
  sortOptions?: (options: OptionType) => OptionType[]
}

export const AdminComboxBox = <
  OptionIdType extends number | string,
  IsMultiSelect extends boolean,
  ValueType extends IsMultiSelect extends true ? any[] : any
>({
  value,
  update,
  options,
  getValueFromId,
  getIdFromValue,
  autocompleteOptions = {
    renderLabel: (_) => (typeof _ === "number" ? String(_) : _),
  },
  disabled,
}: Pick<SingleFieldEditableProps<ValueType>, "update" | "value"> & {
  getIdFromValue: (value: GetArrayOrValueType<ValueType>) => OptionIdType
  getValueFromId: (id: OptionIdType) => GetArrayOrValueType<ValueType>
  options: OptionIdType[]
  autocompleteOptions?: AutocompleteOptions<ValueType, IsMultiSelect>
  disabled?: boolean
}) => {
  const ref = useFieldDisplayAutofocus()

  const optionItems = options.map((_) => ({
    id: getIdFromValue(_ as any),
  }))

  const renderOptionProp = autocompleteOptions.renderOption
    ? {
        renderOption: (props, option) => {
          return autocompleteOptions.renderOption(getValueFromId(option.id))
        },
      }
    : {}

  let currentItemOrItems = null

  if (autocompleteOptions.multiSelect) {
    const arrayValue = (value || []) as ValueType[]
    currentItemOrItems = arrayValue.map((_) => {
      return { id: getIdFromValue(_ as any) }
    })
  } else {
    currentItemOrItems = isUndefinedOrNull(getIdFromValue(value as any))
      ? null
      : { id: getIdFromValue(value as any) }
  }

  return (
    <Autocomplete
      {...renderOptionProp}
      disabled={disabled}
      fullWidth
      isOptionEqualToValue={isEqual}
      disablePortal
      value={currentItemOrItems}
      options={optionItems}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      openOnFocus
      multiple={autocompleteOptions.multiSelect}
      renderInput={(params) => (
        <TextField
          inputRef={ref}
          {...params}
          label={autocompleteOptions.inputLabel}
        />
      )}
      getOptionLabel={(option) => {
        const label = option
          ? autocompleteOptions.renderLabel(getValueFromId(option.id))
          : ""
        return label
      }}
      onChange={(v, newValue: any) => {
        let selectedValueIdOrIds = null
        if (isArray(newValue)) {
          selectedValueIdOrIds = newValue.map((_) => getValueFromId(_.id))
        } else {
          selectedValueIdOrIds = isUndefinedOrNull(newValue?.id)
            ? null
            : getValueFromId(newValue?.id)
        }
        update(selectedValueIdOrIds as GetArrayOrValueType<ValueType>)
      }}
    />
  )
}
