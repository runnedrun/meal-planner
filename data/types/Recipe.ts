import { Timestamp } from "firebase/firestore"
import { Model } from "../baseTypes/Model"
import { Ingredients } from "./Ingredients"

export enum RecipeTag {
  Western = "western",
  Eastern = "eastern",
  Fast = "fast",
  Special = "special",
}

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
