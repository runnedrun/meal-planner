import { Timestamp } from "firebase/firestore"
import { Model } from "../baseTypes/Model"
import { Recipe } from "./Recipe"

export type DayMeals = {
  veg: Recipe
  other: Recipe[]
  score?: number
  dayIndex?: number
}

export type MealPlan = Model<
  "mealPlan",
  {
    startOn: Timestamp
    days: DayMeals[]
  }
>
