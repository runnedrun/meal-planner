import { Recipe } from "@/data/types/Recipe"
import { isServerside } from "@/helpers/isServerside"
import { deepCopy } from "@firebase/util"
import { sum, sumBy } from "lodash-es"
import { BeamSearch } from "./BeamSearch"
import { DayTags } from "./DayTags"
import normalize from "array-normalize"

type DayMeals = {
  veg: Recipe
  other: Recipe[]
  score?: number
  dayIndex?: number
}

const twentyFourHours = 24 * 60 * 60 * 1000

export const DEFAULT_LOOK_FORWARD_SIZE = 4

const generateAllPossibleDayMeals = (
  possibleRecipes: Recipe[],
  dayIndex: number
) => {
  const dayTags = DayTags[dayIndex]?.tags || []
  console.log("genning for day", dayIndex, dayTags)
  const recipesWithRequiredTags = possibleRecipes.filter((recipe) => {
    const recipeHasAllTags = dayTags.every((tag) => recipe.tags?.includes(tag))
    console.log("has it", recipeHasAllTags)
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
        veg: thisVegRecipe,
        other: thisMeatCombo,
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
  const vegLastUsed = getLastUsedForRecipe(dayMeal.veg, recipeIdsToLastUsedMs)
  const otherLastUsedAts = dayMeal.other.map((_) =>
    getLastUsedForRecipe(_, recipeIdsToLastUsedMs)
  )
  const allLastUsedAts = [vegLastUsed, ...otherLastUsedAts]
  const recencyScore = allLastUsedAts.reduce((acc, recipeLastUsed) => {
    return acc + Math.exp(dayStartMs - recipeLastUsed)
  })
  return recencyScore
}

const scoreDayMeals = (dayMeals: DayMeals[], weekStartMs: number) => {
  // gen a map of all the last day used for the recipes in this meal plan
  // then use that map to get the last day used, the fall back to the one set or 0

  const recipeIdsToLastUsedMs = dayMeals.reduce((acc, dayMeal) => {
    const allRecipes = [dayMeal.veg, ...dayMeal.other]
    allRecipes.map((recipe) => {
      acc[recipe.uid] = weekStartMs + dayMeal.dayIndex * twentyFourHours
    })
    return acc
  }, {} as Record<string, number>)

  const cumXqScore = sumBy(
    dayMeals,
    (meals) =>
      meals.veg.xqScore || 2.5 + sumBy(meals.other, (_) => _.xqScore || 2.5)
  )
  const cumDgScore = sumBy(
    dayMeals,
    (meals) =>
      meals.veg.dgScore || 2.5 + sumBy(meals.other, (_) => _.dgScore || 2.5)
  )

  const avgRatingScore = (cumDgScore + cumXqScore) / dayMeals.length
  const cumRecencyscore = sumBy(dayMeals, (meals) =>
    getRecencyScoreForDayMeal(
      meals,
      meals.dayIndex * twentyFourHours + weekStartMs,
      recipeIdsToLastUsedMs
    )
  )

  const averageRecencyScore = cumRecencyscore / dayMeals.length

  const scores = normalize([avgRatingScore, averageRecencyScore])
  return sum(scores)
}

export const genIdealMealPlan = (
  allPossibleRecipes: Recipe[],
  weekStartMs: number,
  log: boolean = false
): DayMeals[] => {
  const recipesClone = deepCopy(allPossibleRecipes)
  const beam = new BeamSearch({
    childrenGenerator: ({ path }: { path: DayMeals[] }) => {
      const prevNode = path[path.length - 1]

      const currentDay = path.length

      const allPossibleMeals = generateAllPossibleDayMeals(
        recipesClone,
        currentDay
      )

      if (!allPossibleMeals.length) {
        return console.error("NO MEALS AVAILABLE for day ", currentDay)
      }

      console.log("allpos", allPossibleMeals.length)

      const newPaths = allPossibleMeals.map((meal) => {
        const newPath = [...path, meal]
        const newScore = scoreDayMeals(newPath, weekStartMs)
        meal.score = newScore
        return { path: newPath }
      })

      console.log("new paths", newPaths.length, allPossibleMeals.length)

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

  console.log("tpshats", paths)

  return paths[0].path
}
