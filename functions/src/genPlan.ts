import { DayMeals, MealPlan } from "@/data/types/MealPlan"
import { Recipe } from "@/data/types/Recipe"
import { Timestamp } from "firebase/firestore"
import moment from "moment"
import { DayTags } from "./helpers/DayTags"
import { genIdealMealPlan } from "./helpers/genMealPlan"
import { testRecipes } from "./test_data/testRecipes"

const logRecipe = (recipe: Recipe) => {
  console.log("name:", recipe.name)
  console.log("tags:", recipe.tags)
  const lastUsedFormattedAsDate = recipe.lastUsedAt
    ? moment(recipe.lastUsedAt.toMillis()).format("e, MM-DD")
    : "never"
  console.log("lastUsed:", lastUsedFormattedAsDate)
}
const logDayMeals = (dayMeals: DayMeals) => {
  console.log("day:", dayMeals.dayIndex, dayMeals.score)
  console.log("requirements:", DayTags[dayMeals.dayIndex].tags)
  console.log("veg:")
  logRecipe(dayMeals.veg)
  console.log("meat 1:")
  logRecipe(dayMeals.other[0])
  console.log("meat 2:")
  logRecipe(dayMeals.other[1])
}

export const logMealPlan = (mealPlan: DayMeals[]) => {
  mealPlan.forEach(logDayMeals)
}

export const genPlan: () => MealPlan = () => {
  const now = moment()
  // const sundayForCurrentWeek = now.clone().startOf("week")
  const dayStart = now.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })
  const plan = genIdealMealPlan(testRecipes, dayStart.valueOf())

  // logMealPlan(plan)
  return {
    startOn: Timestamp.fromMillis(dayStart.valueOf()),
    days: plan,
  } as MealPlan
}
