import { exclusiveOptionalTags, Recipe, RecipeTag } from "@/data/types/Recipe"
import { isServerside } from "@/helpers/isServerside"
import { deepCopy } from "@firebase/util"
import {
  clone,
  memoize,
  partition,
  shuffle,
  sortBy,
  sum,
  sumBy,
} from "lodash-es"
import { BeamSearch } from "./BeamSearch"
import { DayTags } from "./DayTags"
import normalize from "array-normalize"
import { DayMeals } from "@/data/types/MealPlan"
import { discourageDuplicationFor, I } from "@/data/types/Ingredients"

const twentyFourHours = 24 * 60 * 60 * 1000

const nDays = 5

const generateAllPossibleDayMeals = (
  possibleRecipes: Recipe[],
  dayIndex: number
) => {
  const dayTags = DayTags[dayIndex]?.tags || []
  const recipesWithRequiredTags = possibleRecipes.filter((recipe) => {
    const recipeHasAllTags = dayTags.every((tag) => recipe.tags?.includes(tag))
    const recipeDoesntHaveAnyExcludedTags = exclusiveOptionalTags.every((_) => {
      return !recipe.tags?.includes(_) || dayTags.includes(_)
    })
    return recipeHasAllTags && recipeDoesntHaveAnyExcludedTags
  })
  const [standalone, nonStandalone] = partition(
    recipesWithRequiredTags,
    (_) => _.standalone
  )

  const standaloneDayMeals = standalone.map(
    (recipe) => ({ recipes: [recipe], dayIndex } as DayMeals)
  )

  const vegRecipes = nonStandalone.filter((_) => _.veg)
  const nonVegRecipes = nonStandalone.filter((_) => !_.veg)
  const possibleDayMeals = [...standaloneDayMeals] as DayMeals[]

  const allPossibleMeatCombos = nonVegRecipes.flatMap((first, i) =>
    nonVegRecipes.slice(i + 1).map((second) => [first, second])
  )

  vegRecipes.forEach((thisVegRecipe) => {
    allPossibleMeatCombos.forEach((thisMeatCombo) => {
      possibleDayMeals.push({
        recipes: [thisVegRecipe, ...thisMeatCombo],
        dayIndex,
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

export const reverseRecentlyUsedOrder = memoize((recipes: Recipe[]) => {
  return sortBy(recipes, (_) => -_.lastUsedAt)
})

export const getIngredientRecencyScoreForDayMeal = (
  dayMeals: DayMeals,
  dayStartMs: number,
  allRecipes: Recipe[],
  recipeIdsToLastUsedMs: Record<string, number>
) => {
  const reversed = reverseRecentlyUsedOrder(allRecipes)
  const ingredientsByLastUsed = {} as Record<I, number>

  reversed.forEach((recipe) =>
    recipe.ingredients.forEach((ingredient) => {
      if (discourageDuplicationFor.includes(ingredient)) {
        ingredientsByLastUsed[ingredient] =
          recipeIdsToLastUsedMs[recipe.uid] ||
          recipe.lastUsedAt?.toMillis() ||
          0
      }
    })
  )

  const dupIngredientDetractionScore = dayMeals.recipes.reduce(
    (acc, recipe) => {
      const lastUsedForIngredientsWeDontWantToDup = recipe.ingredients
        .map((acc, ingredient) => {
          const lastUsed = ingredientsByLastUsed[ingredient]
          if (lastUsed) {
            return acc + Math.log(dayStartMs - lastUsed + 1)
          }
        })
        .filter(Boolean)
      const averageIngredientScore =
        sum(lastUsedForIngredientsWeDontWantToDup) /
        lastUsedForIngredientsWeDontWantToDup.length

      return acc + averageIngredientScore
    },
    0
  )

  return (-1 * dupIngredientDetractionScore) / 10
}

const getSpecialTagScoreForDayMeals = (dayMeals: DayMeals) => {
  return dayMeals.recipes.some((recipe) => {
    return recipe.tags.includes(RecipeTag.Special)
  })
    ? 2
    : 0
}

const getAverageScoreForPath = (
  path: DayMeals[],
  scoreFn: (dayMeals: DayMeals) => number
) => {
  const allScores = path.map((dayMeal) => scoreFn(dayMeal))
  const cumScore = sum(allScores)

  return cumScore / path.length
}

const scoreDayMeals = (
  dayMeals: DayMeals[],
  weekStartMs: number,
  recipeIdsToLastUsedMs: Record<string, number>,
  allRecipes: Recipe[]
) => {
  // gen a map of all the last day used for the recipes in this meal plan
  // then use that map to get the last day used, the fall back to the one set or 0

  const avgXqScore = getAverageScoreForPath(dayMeals, (dayMeal) =>
    sum(dayMeal.recipes.map((_) => _.xqScore || 2.5))
  )

  const avgDgScore = getAverageScoreForPath(dayMeals, (dayMeal) =>
    sum(dayMeal.recipes.map((_) => _.dgScore || 2.5))
  )

  const avgRatingScore = (avgXqScore + avgDgScore) / 2

  const avgRecencyScore = getAverageScoreForPath(dayMeals, (dayMeal) =>
    getRecencyScoreForDayMeal(
      dayMeal,
      dayMeal.dayIndex * twentyFourHours + weekStartMs,
      recipeIdsToLastUsedMs
    )
  )

  const avgIngredientRecencyScore = getAverageScoreForPath(
    dayMeals,
    (dayMeal) =>
      getIngredientRecencyScoreForDayMeal(
        dayMeal,
        dayMeal.dayIndex * twentyFourHours + weekStartMs,
        allRecipes,
        recipeIdsToLastUsedMs
      )
  )

  const avgSpecialTagScore = getAverageScoreForPath(dayMeals, (dayMeal) =>
    getSpecialTagScoreForDayMeals(dayMeal)
  )

  const scores = [
    avgRatingScore,
    avgRecencyScore,
    avgIngredientRecencyScore,
    avgSpecialTagScore,
  ]

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

      const newPaths = shuffle(allPossibleMeals).map((meal) => {
        const newPath = [...path, meal]
        const newScore = scoreDayMeals(
          newPath,
          weekStartMs,
          recipeIdsToLastUsedMs,
          recipesClone
        )
        meal.score = newScore
        return { path: newPath }
      })

      return newPaths
    },
    solutionValidator: (arg) => {
      return arg.path.length === nDays
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
