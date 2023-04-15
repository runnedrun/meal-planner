import { ForeignKey } from "@/data/baseTypes/ForeignKey"
import { I } from "@/data/types/Ingredients"
import { DayMeals } from "@/data/types/MealPlan"
import {
  getAverageScoreForPath,
  getIngredientRecencyScoreForDayMeal,
  scoreDayMeals,
} from "@/functions/src/helpers/genMealPlan"
import { Timestamp } from "firebase/firestore"

describe("scoring ingredient recency", () => {
  it("should do its thing", () => {
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
})
