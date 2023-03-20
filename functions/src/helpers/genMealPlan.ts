import { Recipe } from "@/data/types/Recipe"
import { isServerside } from "@/helpers/isServerside"
import { deepCopy } from "@firebase/util"
import { clone, sum, sumBy } from "lodash-es"
import { BeamSearch } from "./BeamSearch"
import { DayTags } from "./DayTags"
import normalize from "array-normalize"
import { DayMeals } from "@/data/types/MealPlan"

const twentyFourHours = 24 * 60 * 60 * 1000

export const DEFAULT_LOOK_FORWARD_SIZE = 4

const generateAllPossibleDayMeals = (
  possibleRecipes: Recipe[],
  dayIndex: number
) => {
  const dayTags = DayTags[dayIndex]?.tags || []
  const recipesWithRequiredTags = possibleRecipes.filter((recipe) => {
    const recipeHasAllTags = dayTags.every((tag) => recipe.tags?.includes(tag))
    return recipeHasAllTags
  })
  const vegRecipes = recipesWithRequiredTags.filter((_) => _.veg)
  const nonVegRecipes = recipesWithRequiredTags.filter((_) => !_.veg)
  const possibleDayMeals = [] as DayMeals[]

  const allPossibleMeatCombos = nonVegRecipes.flatMap((first, i) =>
    nonVegRecipes.slice(i + 1).map((second) => [first, second])
  )

  vegRecipes.forEach((thisVegRecipe) => {
    allPossibleMeatCombos.forEach((thisMeatCombo) => {
      possibleDayMeals.push({
        recipes: [thisVegRecipe, ...thisMeatCombo],
        dayIndex: dayIndex,
      })
    })
  })

  return possibleDayMeals
}

const getLastUsedForRecipe = (
  recipe: Recipe,
  recipeIdsToLastUsedMs: Record<string, number>
) => {
  return recipeIdsToLastUsedMs[recipe.uid] || recipe.lastUsedAt?.toMillis() || 0
}

const getRecencyScoreForDayMeal = (
  dayMeal: DayMeals,
  dayStartMs: number,
  recipeIdsToLastUsedMs: Record<string, number>
) => {
  const lastUsedAts = dayMeal.recipes.map((_) =>
    getLastUsedForRecipe(_, recipeIdsToLastUsedMs)
  )

  const recencyScore = lastUsedAts.reduce((acc, recipeLastUsed) => {
    return acc + Math.log(dayStartMs - recipeLastUsed + 1)
  }, 0)

  return recencyScore / 10
}

const scoreDayMeals = (
  dayMeals: DayMeals[],
  weekStartMs: number,
  recipeIdsToLastUsedMs: Record<string, number>
) => {
  // gen a map of all the last day used for the recipes in this meal plan
  // then use that map to get the last day used, the fall back to the one set or 0

  const xqScores = dayMeals.map((_) =>
    sum(_.recipes.map((__) => __.xqScore || 2.5))
  )
  const dgScores = dayMeals.map((_) =>
    sum(_.recipes.map((__) => __.dgScore || 2.5))
  )

  const cumXqScore = sum(xqScores)
  const cumDgScore = sum(dgScores)

  const avgRatingScore = (cumDgScore + cumXqScore) / (dayMeals.length * 2)

  const allRecencyScores = dayMeals.map((dayMeal) =>
    getRecencyScoreForDayMeal(
      dayMeal,
      dayMeal.dayIndex * twentyFourHours + weekStartMs,
      recipeIdsToLastUsedMs
    )
  )
  const cumRecencyScore = sum(allRecencyScores)

  const averageRecencyScore = cumRecencyScore / dayMeals.length

  const scores = [avgRatingScore, averageRecencyScore]
  return sum(scores) / scores.length
}

export const genIdealMealPlan = (
  allPossibleRecipes: Recipe[],
  weekStartMs: number,
  log: boolean = false
): DayMeals[] => {
  const recipesClone = deepCopy(allPossibleRecipes)
  const beam = new BeamSearch({
    childrenGenerator: ({ path }: { path: DayMeals[] }) => {
      const currentDay = path.length

      const recipeIdsToLastUsedMs = path.reduce((acc, dayMeal) => {
        dayMeal.recipes.map((recipe) => {
          acc[recipe.uid] = weekStartMs + dayMeal.dayIndex * twentyFourHours
        })
        return acc
      }, {} as Record<string, number>)

      const allPossibleMeals = generateAllPossibleDayMeals(
        recipesClone,
        currentDay
      )

      if (!allPossibleMeals.length) {
        return console.error("NO MEALS AVAILABLE for day ", currentDay)
      }

      const newPaths = allPossibleMeals.map((meal) => {
        const newPath = [...path, meal]
        const newScore = scoreDayMeals(
          newPath,
          weekStartMs,
          recipeIdsToLastUsedMs
        )
        meal.score = newScore
        return { path: newPath }
      })

      return newPaths
    },
    solutionValidator: (arg) => {
      return arg.path.length === 7
    },
    childrenComparator: (
      pathA: { path: DayMeals[] },
      pathB: { path: DayMeals[] }
    ) => {
      const scoreForNodeA = pathA.path[pathA.path.length - 1].score!
      const scoreForNodeB = pathB.path[pathB.path.length - 1].score!
      const scoreComp = scoreForNodeB! - scoreForNodeA!
      return scoreComp
    },
    width: {
      initial: 10,
    },
  })

  const paths = beam
    .searchFrom({ path: [] })
    .sort(
      ({ path: pathsA }, { path: pathsB }) =>
        pathsB[pathsB.length - 1].score! - pathsA[pathsA.length - 1].score!
    )

  return paths[0].path
}
