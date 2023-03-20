import { nonArchived } from "@/data/firebaseObsBuilders/nonArchived"
import { buildForeignKeySelector } from "../hoc/buildForeignKeySelector"

export const RecipeSelector = buildForeignKeySelector(nonArchived("recipe"), {
  renderLabel: (_) => `${_?.name}`,
  inputLabel: "Recipe",
  multiSelect: false,
})
