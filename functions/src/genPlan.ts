import { filtered } from "@/data/paramObsBuilders/filtered"
import { staticValue } from "@/data/paramObsBuilders/staticValue"
import { DayMeals, MealPlan } from "@/data/types/MealPlan"
import { Recipe } from "@/data/types/Recipe"
import { Timestamp } from "firebase/firestore"
import moment from "moment"
import { DayTags } from "./helpers/DayTags"
import { genIdealMealPlan, PathDayMeals } from "./helpers/genMealPlan"
import { recipes } from "./test_data/recipes"
// import { testRecipes as recipes } from "./test_data/testRecipes"

const logRecipe = (recipe: Recipe) => {
  console.log("name:", recipe.name)
  console.log("tags:", recipe.tags)
}
const logDayMeals = (dayMeals: PathDayMeals, i: number) => {
  console.log("day:", dayMeals.score, dayMeals.scores)
  console.log("requirements:", DayTags[i].tags)
  console.log("veg:")
  logRecipe(dayMeals.recipes[0])
  console.log("meat 1:")
  logRecipe(dayMeals.recipes[1])
  console.log("meat 2:")
  logRecipe(dayMeals.recipes[2])
}

export const logMealPlan = (mealPlan: PathDayMeals[]) => {
  mealPlan.forEach(logDayMeals)
}

export const getAllRecentMealPlans = () =>
  filtered(
    "mealPlan",
    { archived: staticValue(false) },
    { orderBy: { createdAt: staticValue("asc") } }
  )

export const genPlan = async (): Promise<MealPlan> => {
  const now = moment()
  // const sundayForCurrentWeek = now.clone().startOf("week")
  const dayStart = now.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })

  const prevMealPlans = await getAllRecentMealPlans()

  const plan = genIdealMealPlan(recipes, prevMealPlans, dayStart.valueOf())

  logMealPlan(plan)

  return {
    startOn: Timestamp.fromMillis(dayStart.valueOf()),
    days: plan as DayMeals[],
  } as MealPlan
}
