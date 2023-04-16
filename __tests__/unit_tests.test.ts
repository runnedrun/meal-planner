import { ForeignKey } from "@/data/baseTypes/ForeignKey"
import { I } from "@/data/types/Ingredients"
import { DayMeals } from "@/data/types/MealPlan"
import { RecipeTag } from "@/data/types/Recipe"
import {
  getAverageScoreForPath,
  getIngredientRecencyScoreForDayMeal,
  scoreDayMeals,
} from "@/functions/src/helpers/genMealPlan"
import { Timestamp } from "firebase/firestore"

describe("score as expected", () => {
  it("should score ingredient recency", () => {
    const dayMealsWithDupIngredient = [
      {
        recipes: [
          {
            uid: "1" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            // tags: [RecipeTag.]
            ingredients: [I.bokchoi, I.garlic, I.onion],
            veg: true,
          },
          {
            uid: "2" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            ingredients: [I.porkBelly, I.garlic, I.onion],
            veg: false,
          },
          {
            uid: "3" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 0,
      },
      {
        recipes: [
          {
            uid: "1" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            // tags: [RecipeTag.]
            ingredients: [I.bokchoi, I.garlic, I.onion],
            veg: true,
          },
          {
            uid: "2" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            ingredients: [I.porkBelly, I.garlic, I.onion],
            veg: false,
          },
          {
            uid: "3" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 1,
      },
    ] as DayMeals[]

    const dayMealsWithoutDupIngredient = [
      {
        recipes: [
          {
            uid: "1" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            // tags: [RecipeTag.]
            ingredients: [I.bokchoi, I.garlic, I.onion],
            veg: true,
          },
          {
            uid: "2" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            ingredients: [I.porkBelly, I.garlic, I.onion],
            veg: false,
          },
          {
            uid: "3" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 0,
      },
      {
        recipes: [
          {
            uid: "4" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            // tags: [RecipeTag.]
            ingredients: [I.bokchoi, I.garlic, I.onion],
            veg: true,
          },
          {
            uid: "5" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            ingredients: [I.chickenChunks, I.garlic, I.onion],
            veg: false,
          },
          {
            uid: "6" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 1,
      },
    ] as DayMeals[]

    const scoresWith = scoreDayMeals(dayMealsWithDupIngredient, 1, [])
    const scoresWithout = scoreDayMeals(dayMealsWithoutDupIngredient, 1, [])
    expect(scoresWith.sumScore).toBeLessThan(scoresWithout.sumScore)
  })
  it("should score type consistency", () => {
    const has = [
      {
        recipes: [
          {
            uid: "1" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            // tags: [RecipeTag.]
            ingredients: [I.bokchoi, I.garlic, I.onion],
            tags: [RecipeTag.Eastern],
            veg: true,
          },
          {
            uid: "2" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            ingredients: [I.porkBelly, I.garlic, I.onion],
            tags: [RecipeTag.Eastern],
            veg: false,
          },
          {
            uid: "3" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            tags: [RecipeTag.Eastern],
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 0,
      },
      {
        recipes: [
          {
            uid: "1" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            // tags: [RecipeTag.]
            ingredients: [I.bokchoi, I.garlic, I.onion],
            tags: [RecipeTag.Eastern],
            veg: true,
          },
          {
            uid: "2" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            ingredients: [I.porkBelly, I.garlic, I.onion],
            tags: [RecipeTag.Eastern],
            veg: false,
          },
          {
            uid: "3" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            tags: [RecipeTag.Eastern],
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 1,
      },
    ] as DayMeals[]

    const hasNot = [
      {
        recipes: [
          {
            uid: "1" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            // tags: [RecipeTag.]
            tags: [RecipeTag.Eastern],
            ingredients: [I.bokchoi, I.garlic, I.onion],
            veg: true,
          },
          {
            uid: "2" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            ingredients: [I.porkBelly, I.garlic, I.onion],
            veg: false,
          },
          {
            uid: "3" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            tags: [RecipeTag.Eastern],
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 0,
      },
      {
        recipes: [
          {
            uid: "4" as ForeignKey<"recipe">,
            name: "test recipe 1",
            xqScore: 0,
            tags: [RecipeTag.Eastern],
            ingredients: [I.bokchoi, I.garlic, I.onion],
            veg: true,
          },
          {
            uid: "5" as ForeignKey<"recipe">,
            name: "test recipe 2",
            xqScore: 0,
            tags: [RecipeTag.Western],
            ingredients: [I.chickenChunks, I.garlic, I.onion],
            veg: false,
          },
          {
            uid: "6" as ForeignKey<"recipe">,
            name: "test recipe 3",
            xqScore: 0,
            veg: false,
            tags: [RecipeTag.Western],
            ingredients: [I.garlic, I.onion],
          },
        ],
        dayIndex: 1,
      },
    ] as DayMeals[]

    const scoresHas = scoreDayMeals(has, 1, [])
    const scoresHasNot = scoreDayMeals(hasNot, 1, [])
    console.log("scores", scoresHas, scoresHasNot)
    expect(scoresHasNot.sumScore).toBeLessThan(scoresHas.sumScore)
  })
})
