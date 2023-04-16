import { ForeignKey } from "@/data/baseTypes/ForeignKey"
import { Recipe, RecipeTag } from "@/data/types/Recipe"
import { Timestamp } from "firebase/firestore"
import { I as I } from "@/data/types/Ingredients"

export const testRecipes: Recipe[] = [
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
    ingredients: [I.porkBelly, I.garlic, I.onion],
  },
  {
    uid: "4" as ForeignKey<"recipe">,
    name: "test recipe 4",
    xqScore: 0,
    veg: false,
    ingredients: [I.chickenChunks, I.garlic, I.onion],
  },
  {
    uid: "5" as ForeignKey<"recipe">,
    name: "test recipe 5",
    xqScore: 0,
    veg: false,
    ingredients: [I.chickenChunks, I.garlic, I.onion],
  },
  {
    uid: "6" as ForeignKey<"recipe">,
    name: "test recipe 6",
    xqScore: 0,
    veg: false,
    ingredients: [I.chineseCabbage, I.garlic, I.onion],
    tags: [],
  },

  {
    uid: "7" as ForeignKey<"recipe">,
    name: "test recipe 7",
    xqScore: 0,
    veg: true,
    ingredients: [I.garlic, I.onion],
  },
  {
    uid: "8" as ForeignKey<"recipe">,
    name: "test recipe 8",
    xqScore: 0,
    veg: false,
    ingredients: [I.chickenBroth, I.garlic, I.onion],
    tags: [],
  },
  // {
  //   uid: "9" as ForeignKey<"recipe">,
  //   name: "test recipe 9 - fast",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  //   tags: [RecipeTag.Fast],
  // },
  // {
  //   uid: "10" as ForeignKey<"recipe">,
  //   name: "fast test recipe 10",
  //   xqScore: 0,
  //   lastUsedAt: Timestamp.fromMillis(10000000),
  //   tags: [RecipeTag.Fast],
  //   veg: true,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "11" as ForeignKey<"recipe">,
  //   name: "test recipe 11",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   tags: [RecipeTag.Fast],
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "12" as ForeignKey<"recipe">,
  //   name: "test recipe 12",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   tags: [],
  //   veg: true,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "13" as ForeignKey<"recipe">,
  //   name: "test recipe 13",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   tags: [],
  //   veg: true,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "14" as ForeignKey<"recipe">,
  //   name: "test recipe 14",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "15" as ForeignKey<"recipe">,
  //   name: "test recipe 15",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "16" as ForeignKey<"recipe">,
  //   name: "test recipe 16",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "17" as ForeignKey<"recipe">,
  //   name: "test recipe 17",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "18" as ForeignKey<"recipe">,
  //   name: "test recipe 18",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "19" as ForeignKey<"recipe">,
  //   name: "test recipe 19",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "20" as ForeignKey<"recipe">,
  //   name: "test recipe 20",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "21" as ForeignKey<"recipe">,
  //   name: "test recipe 21",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "22" as ForeignKey<"recipe">,
  //   name: "test recipe 22",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "23" as ForeignKey<"recipe">,
  //   name: "test recipe 23",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "24" as ForeignKey<"recipe">,
  //   name: "test recipe 24",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
  // {
  //   uid: "25" as ForeignKey<"recipe">,
  //   name: "test recipe 25",
  //   xqScore: 0,
  //   lastUsedAt: null,
  //   veg: false,
  //   ingredients: [I.chickenBroth, I.garlic, I.onion],
  // },
]
