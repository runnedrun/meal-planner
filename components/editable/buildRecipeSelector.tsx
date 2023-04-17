import { nonArchived } from "@/data/firebaseObsBuilders/nonArchived"
import { combine } from "@/data/paramObsBuilders/combine"
import { DayMeals } from "@/data/types/MealPlan"
import { Recipe } from "@/data/types/Recipe"
import { getAllRecentMealPlans } from "@/functions/src/genPlan"
import {
  getDayMealsFromMealPlans,
  scoreDayMeals,
} from "@/functions/src/helpers/genMealPlan"
import { sortBy } from "lodash-es"
import { map } from "rxjs"
import { buildForeignKeySelector } from "../hoc/buildForeignKeySelector"

export const buildRecipeSelector = (
  getReplacedPath: (recipe: Recipe) => DayMeals[],
  weekStartMs: number
) => {
  const recipesSortedByScore = combine({
    recipes: nonArchived("recipe"),
    mealPlans: getAllRecentMealPlans(),
  }).pipe(
    map(({ recipes, mealPlans }) => {
      const sorted = sortBy(recipes, (recipe) => {
        const newPath = getReplacedPath(recipe)
        const score = scoreDayMeals(
          newPath,
          weekStartMs,
          getDayMealsFromMealPlans(mealPlans)
        )
        return -1 * score.sumScore
      })
      return sorted
    })
  )

  return buildForeignKeySelector(recipesSortedByScore, {
    renderLabel: (_) => `${_?.name}`,
    inputLabel: "Recipe",
    multiSelect: false,
  })
}
