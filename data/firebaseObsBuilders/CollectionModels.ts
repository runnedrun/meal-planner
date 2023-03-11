import { FirestoreDataConverter } from "@firebase/firestore"
import { buildConverterForType } from "../builders/buildConverterForType"
import { Recipe } from "../types/Recipe"

export const CollectionsWithConverters: {
  [key in keyof CollectionModels]: FirestoreDataConverter<CollectionModels[key]>
} = {
  recipe: buildConverterForType<Recipe>(),
}

export type AllModels = {
  recipe: Recipe
}

export type CollectionModels = Omit<AllModels, "user">
