import { RecipeTag } from "@/data/types/Recipe"

type DayTags = Record<number, { tags: RecipeTag[] }>

// Sunday = 0
export const DayTags: DayTags = {
  0: { tags: [] },
  1: { tags: [] },
  2: { tags: [] },
  3: { tags: [] },
  4: { tags: [] },
  5: { tags: [RecipeTag.Special] },
  6: { tags: [] },
}
