import { discourageDuplicationFor, I } from "@/data/types/Ingredients"
import { DayMeals, MealPlan, MealPlanRecipe } from "@/data/types/MealPlan"
import { exclusiveOptionalTags, Recipe, RecipeTag } from "@/data/types/Recipe"
import { objKeys } from "@/helpers/objKeys"
import { deepCopy } from "@firebase/util"
import { Timestamp } from "firebase/firestore"
import { clone, last, partition, shuffle, sum, sumBy } from "lodash-es"
import moment from "moment"
import { BeamSearch } from "./BeamSearch"
import { DayTags } from "./DayTags"

export interface PathDayMeals extends DayMeals {
  scores: Record<string, number>
}

const twentyFourHours = 24 * 60 * 60 * 1000

const nDays = 5
const minFillingLevel = 7

export const generateAllPossibleDayMeals = (
  possibleRecipes: Recipe[],
  currentDayTimestamp: Timestamp
) => {
  const dayOfWeekIndex = moment(currentDayTimestamp.toMillis()).day()
  const dayTags = DayTags[dayOfWeekIndex]?.tags || []
  const recipesWithRequiredTags = possibleRecipes.filter((recipe) => {
    const recipeHasAllTags = dayTags.every(
      (tag) => recipe.tags?.includes(tag) || exclusiveOptionalTags.includes(tag)
    )
    const recipeDoesntHaveAnyExcludedTags = exclusiveOptionalTags.every((_) => {
      return !recipe.tags?.includes(_) || dayTags.includes(_)
    })
    return recipeHasAllTags && recipeDoesntHaveAnyExcludedTags
  })
  const [standalone, nonStandalone] = partition(
    recipesWithRequiredTags,
    (_) => _.fillingLevel === 10
  )

  const standaloneDayMeals = standalone.map(
    (recipe) =>
      ({
        recipes: [{ ...recipe, usedOn: currentDayTimestamp }],
        startsOn: currentDayTimestamp,
      } as DayMeals)
  )

  const vegRecipes = nonStandalone.filter((_) => _.veg)
  const nonVegRecipes = nonStandalone.filter((_) => !_.veg)
  const possibleDayMeals = [...standaloneDayMeals] as DayMeals[]

  const allPossibleMeatCombos = nonVegRecipes.flatMap((first, i) =>
    nonVegRecipes
      .slice(i + 1)
      .map((second) => [
        { ...first, usedOn: currentDayTimestamp } as MealPlanRecipe,
        { ...second, usedOn: currentDayTimestamp } as MealPlanRecipe,
      ])
  )

  vegRecipes.forEach((thisVegRecipe) => {
    allPossibleMeatCombos.forEach((thisMeatCombo) => {
      possibleDayMeals.push({
        recipes: [
          { ...thisVegRecipe, usedOn: currentDayTimestamp },
          ...thisMeatCombo,
        ],
      })
    })
  })

  const allDayMealsWith4MealDays = [] as DayMeals[]

  const eligible4DishVegRecipes = vegRecipes.filter(
    (_) => (_.fillingLevel || 3) > 1
  )

  possibleDayMeals.forEach((meals) => {
    const fillingScoreSum = sumBy(meals.recipes, (_) => _.fillingLevel || 3)
    if (fillingScoreSum < minFillingLevel) {
      const recipesToAdd = [...nonVegRecipes, ...eligible4DishVegRecipes]
      recipesToAdd.forEach((recipe) => {
        allDayMealsWith4MealDays.push({
          recipes: [
            ...meals.recipes,
            { ...recipe, usedOn: currentDayTimestamp },
          ],
        })
      })
    } else {
      allDayMealsWith4MealDays.push(meals)
    }
  })

  return allDayMealsWith4MealDays
}

const getLastUsedFromPath = (path: DayMeals[]) => {
  return path.reduce((acc, dayMeal) => {
    dayMeal.recipes.map((recipe) => {
      acc[recipe.uid] = acc[recipe.uid] || []
      acc[recipe.uid].push(recipe.usedOn.toMillis())
    })
    return acc
  }, {} as Record<string, number[]>)
}

const getIngredientLastUsedFromPathAndAllRecipes = (path: DayMeals[]) => {
  const acc = {} as Record<I, number[]>

  path.forEach((dayMeal) => {
    dayMeal.recipes.forEach((recipe) => {
      recipe.ingredients.map((ingredient) => {
        if (discourageDuplicationFor.includes(ingredient)) {
          acc[ingredient] = acc[ingredient] || []
          acc[ingredient].push(recipe.usedOn.toMillis())
        }
      })
    })
  })
  return acc
}

const getLastUsedForRecipe = (
  recipe: Recipe,
  recipeIdsToLastUsedMs: Record<string, number[]>
) => {
  const allLastUsed = recipeIdsToLastUsedMs[recipe.uid] || []
  return last(allLastUsed) || 0
}

const getMostRecentIngredientLastUsed = (
  ingredient: I,
  ingredientIdsToLastUsedMs: Record<I, number[]>,
  todayInMs: number
) => {
  const lastUsed = clone(ingredientIdsToLastUsedMs[ingredient] || [])
  const indexOfToday = lastUsed.findIndex((lastUsed) => todayInMs === lastUsed)

  lastUsed.splice(indexOfToday, 1)

  return last(lastUsed)
}

const scoreRecency = (
  dayMeal: DayMeals,
  dayStartMs: number,
  pathUntilYesterday: DayMeals[]
) => {
  const recipeIdsToLastUsedMs = getLastUsedFromPath(pathUntilYesterday)

  const lastUsedAts = dayMeal.recipes.map((_) =>
    getLastUsedForRecipe(_, recipeIdsToLastUsedMs)
  )

  const recencyScore = lastUsedAts.reduce((acc, recipeLastUsed) => {
    return acc + Math.log(dayStartMs - recipeLastUsed + 1)
  }, 0)

  const avgRecencyScore = recencyScore / dayMeal.recipes.length

  return avgRecencyScore / 3
}

export const getIngredientRecencyScoreForDayMeal = (
  dayMeals: DayMeals,
  dayStartMs: number,
  pathUpUntilToday: DayMeals[]
) => {
  const lastUsedByIngredient =
    getIngredientLastUsedFromPathAndAllRecipes(pathUpUntilToday)

  const dupIngredientDetractionScore = dayMeals.recipes.reduce(
    (acc, recipe) => {
      const lastUsedForIngredientsWeDontWantToDup = recipe.ingredients
        .map((ingredient) => {
          const lastUsed = getMostRecentIngredientLastUsed(
            ingredient,
            lastUsedByIngredient,
            dayStartMs
          )
          if (lastUsed) {
            const diff = Math.log(twentyFourHours / (dayStartMs - lastUsed + 1))
            return diff
          }
        })
        .filter(Boolean)

      const averageIngredientScore =
        lastUsedForIngredientsWeDontWantToDup.length
          ? sum(lastUsedForIngredientsWeDontWantToDup) /
            lastUsedForIngredientsWeDontWantToDup.length
          : -1

      return acc + averageIngredientScore
    },
    0
  )

  return (-1 * dupIngredientDetractionScore) / 10
}

const scoreSpecialTags = (dayMeals: DayMeals) => {
  return dayMeals.recipes.some((recipe) => {
    return recipe.tags?.includes(RecipeTag.Special)
  })
    ? 2
    : 0
}

export const getAverageScoreForPath = (
  path: DayMeals[],
  scoreFn: (dayMeals: DayMeals, i: number) => number
) => {
  const allScores = path.map((dayMeal, i) => scoreFn(dayMeal, i))
  const cumScore = sum(allScores)

  return cumScore / path.length
}

// so now I want a few tweaks. 1, I want to group eastern and non eastern meals together. So there should be a higher
// score if all the meals for a day are eastern or western.

const scoreTypeConsistency = (dayMeals: DayMeals) => {
  const allNotEastern = dayMeals.recipes.every(
    (_) => !_.tags?.includes(RecipeTag.Eastern)
  )
  const allEastern = dayMeals.recipes.every((_) =>
    _.tags?.includes(RecipeTag.Eastern)
  )
  return allNotEastern || allEastern ? 4 : 0
}

const scoreVegMeatBalance = (dayMeals: DayMeals) => {
  return dayMeals.recipes.some((_) => _.veg) ? 5 : 0
}

const scoreNumberOfRecipes = (dayMeals: DayMeals) => {
  return dayMeals.recipes.length > 3 ? -1 : 0
}

const scoreFillingLevel = (dayMeals: DayMeals) => {
  return sumBy(dayMeals.recipes, (_) => _.fillingLevel || 3) < minFillingLevel
    ? -5
    : 0
}

const scoreRatings = (dayMeals: DayMeals) => {
  const dgClear = dayMeals.recipes.some((_) => (_.dgScore || 3) > 2)
  const xqClear = dayMeals.recipes.some((_) => (_.xqScore || 3) > 2)
  return dgClear && xqClear ? 0 : -2
}

type DayMealScorer = (dayMeals: DayMeals, i: number) => number

const buildPathScorer =
  (scorers: Record<string, DayMealScorer>) => (path: DayMeals[]) => {
    const scores = {} as Record<string, number>
    objKeys(scorers).forEach((scorerName) => {
      const scorer = scorers[scorerName]
      scores[scorerName] = getAverageScoreForPath(path, scorer)
    })

    return {
      sumScore: sum(Object.values(scores)),
      allScores: scores,
    }
  }

export const scoreDayMeals = (
  dayMeals: DayMeals[],
  weekStartMs: number,
  historicalMeals: DayMeals[]
) => {
  return buildPathScorer({
    scoreRatings,
    scoreRecency: (dayMeal, i) =>
      scoreRecency(dayMeal, i * twentyFourHours + weekStartMs, [
        ...historicalMeals,
        ...dayMeals.slice(0, i),
      ]),
    ingredientRecency: (dayMeal, i) => {
      return getIngredientRecencyScoreForDayMeal(
        dayMeal,
        i * twentyFourHours + weekStartMs,
        [...historicalMeals, ...dayMeals.slice(0, i + 1)]
      )
    },
    scoreSpecialTags,
    scoreTypeConsistency,
    scoreVegMeatBalance,
    scoreNumberOfRecipes,
    scoreFillingLevel,
  })(dayMeals)
}

export const getDayMealsFromMealPlans = (mealPlans: MealPlan[]) => {
  return mealPlans.flatMap((plan) => {
    return plan.days
  })
}

export const genIdealMealPlan = (
  allPossibleRecipes: Recipe[],
  previousMealPlans: MealPlan[],
  weekStartMs: number,
  log: boolean = false
): PathDayMeals[] => {
  const recipesClone = deepCopy(allPossibleRecipes)

  const historicalMeals = getDayMealsFromMealPlans(previousMealPlans)

  const beam = new BeamSearch({
    childrenGenerator: ({ path }: { path: PathDayMeals[] }) => {
      const currentDay = path.length
      const currentDayTimestamp = Timestamp.fromMillis(
        currentDay * twentyFourHours + weekStartMs
      )

      const allPossibleMeals = generateAllPossibleDayMeals(
        recipesClone,
        currentDayTimestamp
      )

      if (!allPossibleMeals.length) {
        return console.error("NO MEALS AVAILABLE for day ", currentDay)
      }

      const newPaths = shuffle(allPossibleMeals).map((meal: PathDayMeals) => {
        const newPath = [...path, meal]

        const { sumScore: avgScore, allScores } = scoreDayMeals(
          newPath,
          weekStartMs,
          historicalMeals
        )
        meal.score = avgScore
        meal.scores = allScores

        return { path: newPath }
      })

      return newPaths
    },
    solutionValidator: (arg) => {
      return arg.path.length === nDays
    },
    childrenComparator: (
      pathA: { path: PathDayMeals[] },
      pathB: { path: PathDayMeals[] }
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
