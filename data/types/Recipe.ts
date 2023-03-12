import { Timestamp } from "firebase/firestore"
import { Model } from "../baseTypes/Model"

export enum RecipeTag {
  Western = "western",
  Eastern = "eastern",
  Fast = "fast",
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
  }
>
