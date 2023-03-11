import { ComponentContextContext } from "@/views/view_builder/component"
import { useContext } from "react"

export const useComponentContext = () => {
  const context = useContext(ComponentContextContext)
  if (!context) {
    throw new Error(
      "Component Context not initialized, make sure the root component is wrapped by component or rootComponent"
    )
  }
  return context
}
