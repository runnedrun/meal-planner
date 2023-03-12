import { ForeignKey } from "@/data/baseTypes/ForeignKey"
import { Recipe, RecipeTag } from "@/data/types/Recipe"
import { Timestamp } from "firebase/firestore"

export const testRecipes: Recipe[] = [
  {
    uid: "1" as ForeignKey<"recipe">,
    name: "test recipe 1",
    xqScore: -1,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "2" as ForeignKey<"recipe">,
    name: "test recipe 2",
    xqScore: 0,
    lastUsedAt: Timestamp.fromMillis(700),
    veg: false,
  },
  {
    uid: "3" as ForeignKey<"recipe">,
    name: "test recipe 3",
    xqScore: 0,
    lastUsedAt: Timestamp.fromMillis(800),
    veg: false,
  },
  {
    uid: "4" as ForeignKey<"recipe">,
    name: "test recipe 4",
    xqScore: 0,
    lastUsedAt: Timestamp.fromMillis(900),
    veg: false,
  },
  {
    uid: "5" as ForeignKey<"recipe">,
    name: "test recipe 5",
    xqScore: 0,
    lastUsedAt: Timestamp.fromMillis(100),
    veg: false,
  },
  {
    uid: "6" as ForeignKey<"recipe">,
    name: "test recipe 6 - fast",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
    tags: [RecipeTag.Fast],
  },
  {
    uid: "7" as ForeignKey<"recipe">,
    name: "test recipe 7",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "8" as ForeignKey<"recipe">,
    name: "test recipe 8 - fast",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
    tags: [RecipeTag.Fast],
  },
  {
    uid: "9" as ForeignKey<"recipe">,
    name: "test recipe 9 - fast",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
    tags: [RecipeTag.Fast],
  },
  {
    uid: "10" as ForeignKey<"recipe">,
    name: "fast test recipe 10",
    xqScore: 0,
    lastUsedAt: null,
    tags: [RecipeTag.Fast],
    veg: true,
  },
  {
    uid: "11" as ForeignKey<"recipe">,
    name: "test recipe 11",
    xqScore: 0,
    lastUsedAt: null,
    tags: [RecipeTag.Fast],
    veg: true,
  },
  {
    uid: "12" as ForeignKey<"recipe">,
    name: "test recipe 12",
    xqScore: 0,
    lastUsedAt: null,
    tags: [RecipeTag.Fast],
    veg: true,
  },
  {
    uid: "13" as ForeignKey<"recipe">,
    name: "test recipe 13",
    xqScore: 0,
    lastUsedAt: null,
    tags: [RecipeTag.Fast],
    veg: true,
  },
  {
    uid: "14" as ForeignKey<"recipe">,
    name: "test recipe 14",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "15" as ForeignKey<"recipe">,
    name: "test recipe 15",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "16" as ForeignKey<"recipe">,
    name: "test recipe 16",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "17" as ForeignKey<"recipe">,
    name: "test recipe 17",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "18" as ForeignKey<"recipe">,
    name: "test recipe 18",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "19" as ForeignKey<"recipe">,
    name: "test recipe 19",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "20" as ForeignKey<"recipe">,
    name: "test recipe 20",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "21" as ForeignKey<"recipe">,
    name: "test recipe 21",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "22" as ForeignKey<"recipe">,
    name: "test recipe 22",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "23" as ForeignKey<"recipe">,
    name: "test recipe 23",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "24" as ForeignKey<"recipe">,
    name: "test recipe 24",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
  {
    uid: "25" as ForeignKey<"recipe">,
    name: "test recipe 25",
    xqScore: 0,
    lastUsedAt: null,
    veg: false,
  },
]
