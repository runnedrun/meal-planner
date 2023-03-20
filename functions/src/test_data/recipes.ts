import { ForeignKey } from "@/data/baseTypes/ForeignKey"
import { Recipe, RecipeTag } from "@/data/types/Recipe"
import { objKeys } from "@/helpers/objKeys"
import { uniq } from "lodash-es"
import { Ingredients as I } from "@/data/types/Ingredients"

export const recipes: Recipe[] = [
  {
    uid: "1" as ForeignKey<"recipe">,
    name: "Steamed Chicken Salad",
    tags: [RecipeTag.Fast, RecipeTag.Western],
    ingredients: [
      I.chickenChunks,
      I.salad,
      I.salad,
      I.tomatoes,
      I.avocado,
      I.goatCheese,
      I.cranberries,
    ],
  },
  {
    uid: "2" as ForeignKey<"recipe">,
    name: "Korean Pork Strips with Kimchi",
    tags: [RecipeTag.Eastern],
    ingredients: [I.porkStrips, I.kimchi, I.onion, I.gochujang],
  },
  {
    uid: "2" as ForeignKey<"recipe">,
    name: "Kimchi Jiggae",
    tags: [RecipeTag.Eastern],
    ingredients: [
      I.porkBelly,
      I.frozenSeafoodMix,
      I.kimchi,
      I.gochujang,
      I.onion,
    ],
  },
  {
    uid: "3" as ForeignKey<"recipe">,
    name: "Pork Stew with corn and butternut squash",
    tags: [RecipeTag.Fast, RecipeTag.Western],
    ingredients: [
      I.stewPork,
      I.butternutSquash,
      I.cannedCorn,
      I.beanSprouts,
      I.cannedTomatoes,
      I.onion,
      I.chickenBroth,
    ],
  },
  {
    uid: "4" as ForeignKey<"recipe">,
    name: "Taiwanese Chicken in Air Fryer",
    tags: [RecipeTag.Eastern],
    ingredients: [I.chickenChunks, I.tapiocaFlour],
  },
  {
    uid: "5" as ForeignKey<"recipe">,
    name: "Shrimp with Peppers and eggs",
    tags: [RecipeTag.Eastern],
    ingredients: [I.bigShrimp, I.garlic, I.eggs, I.qingjiao],
  },
]

if (uniq(objKeys(recipes)) !== objKeys(recipes)) {
  throw new Error("Duplicate recipe UIDs")
}
