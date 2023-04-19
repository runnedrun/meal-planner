import { Timestamp } from "firebase/firestore"
import { Model } from "../baseTypes/Model"
import { Recipe } from "./Recipe"

export interface MealPlanRecipe extends Recipe {
  usedOn: Timestamp
}

export type DayMeals = {
  recipes: MealPlanRecipe[]
  score?: number
  ignored: boolean
}

export type MealPlan = Model<
  "mealPlan",
  {
    startOn: Timestamp
    days: DayMeals[]
    isDraft: boolean
  }
>
