import { Timestamp } from "firebase/firestore"
import { Model } from "../baseTypes/Model"
import { I } from "./Ingredients"

export enum RecipeTag {
  Western = "western",
  Eastern = "eastern",
  Fast = "fast",
  Special = "special",
}

// these tags are ONLY allowed on the day that contains them, but
// are optional for that day
export const exclusiveOptionalTags = [RecipeTag.Special]

export type FillingLevel = 1 | 2 | 3 | 4 | 5 | 10

export type Recipe = Model<
  "recipe",
  {
    name: string
    xqScore?: number
    dgScore?: number
    veg?: boolean
    tags?: RecipeTag[]
    ingredients: I[]
    notes?: string
    fillingLevel?: FillingLevel
  }
>
