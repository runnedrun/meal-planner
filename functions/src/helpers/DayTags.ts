import { RecipeTag } from "@/data/types/Recipe"

type DayTags = Record<number, { tags: RecipeTag[] }>

// Sunday = 0
export const DayTags: DayTags = {
  0: { tags: [] },
  1: { tags: [] },
  2: { tags: [] },
  3: { tags: [] },
  4: { tags: [RecipeTag.Fast] },
  5: { tags: [] },
  6: { tags: [RecipeTag.Special] },
}
