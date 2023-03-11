import { useEffect, useState } from "react"
import { EditingState } from "../firebaseObsBuilders/fbWriter"

export const useEditToggling = <ObjectType extends any>(
  liveObject: ObjectType,
  setLiveObject: (newObject: ObjectType) => void,
  defaultEditingState: EditingState = EditingState.Cancelled
) => {
  const [editingState, setEditingState] = useState(defaultEditingState)
  const [editableObject, editObject] = useState(liveObject)

  const currentData =
    editingState === EditingState.Editing ? editableObject : liveObject

  useEffect(() => {
    if (editingState === EditingState.Saved) {
      setLiveObject(editableObject)
    }
  }, [editingState])

  return {
    currentData,
    setEditingState,
    editingState,
    editCurrentData: editObject,
  }
}
