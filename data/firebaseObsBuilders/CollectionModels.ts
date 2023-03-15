import { FirestoreDataConverter } from "@firebase/firestore"
import { buildConverterForType } from "../builders/buildConverterForType"
import { MealPlan } from "../types/MealPlan"
import { Recipe } from "../types/Recipe"

export const CollectionsWithConverters: {
  [key in keyof CollectionModels]: FirestoreDataConverter<CollectionModels[key]>
} = {
  recipe: buildConverterForType<Recipe>(),
  mealPlan: buildConverterForType<MealPlan>(),
}

export type AllModels = {
  recipe: Recipe
  mealPlan: MealPlan
}

export type CollectionModels = Omit<AllModels, "user">
