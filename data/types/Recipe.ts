import { Timestamp } from "firebase/firestore"
import { Model } from "../baseTypes/Model"
import { Ingredients } from "./Ingredients"

export enum RecipeTag {
  Western = "western",
  Eastern = "eastern",
  Fast = "fast",
  Special = "special",
}

// these tags are ONLY allowed on the day that contains them, but
// are optional for that day
export const exclusiveOptionalTags = [RecipeTag.Special]

export type Recipe = Model<
  "recipe",
  {
    name: string
    xqScore?: number
    dgScore?: number
    lastUsedAt?: Timestamp
    veg?: boolean
    tags?: RecipeTag[]
    ingredients: Ingredients[]
    notes?: string
    standalone?: boolean
  }
>
