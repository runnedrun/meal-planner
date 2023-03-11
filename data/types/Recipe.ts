import { Model } from "../baseTypes/Model"

export type Recipe = Model<
  "recipe",
  {
    name: string
  }
>
