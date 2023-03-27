export enum I {
  // meat
  chickenChunks = "chicken chunks",
  wholeChicken = "whole chicken",
  porkStrips = "pork strips",
  porkBelly = "pork belly",
  stewPork = "stew pork",
  groundPork = "ground pork",
  sausage = "sausage",
  chorizo = "chorizo",
  chickenWings = "chicken wings",
  salmon = "salmon",
  ham = "ham",
  bacon = "bacon",
  porkNeck = "pork neck",
  duck = "duck",
  tigerShrimp = "tiger shrimp",
  ribs = "ribs",

  // frozen
  frozenSeafoodMix = "frozen seafood mix",
  bigShrimp = "big shrimp",
  frozenSpinach = "frozen spinach",
  smallShrimp = "small shrimp",
  fishBalls = "fish balls",
  frozenFish = "frozen fish",

  // veg
  ginger = "ginger",
  garlic = "garlic",
  onion = "onion",
  qingjiao = "qingjiao",
  beanSprouts = "bean sprouts",
  mushrooms = "mushrooms",
  driedMushrooms = "dried mushrooms",
  tofu = "tofu",
  cauliflower = "cauliflower",
  greenBeans = "green beans",
  flatBeans = "flat beans",
  springOnions = "spring onions",
  celery = "celery",
  potatoes = "potatoes",
  bigTomatoes = "big tomatoes",
  spinach = "spinach",
  bokchoi = "bokchoi",
  chineseCabbage = "chinese cabbage",
  whiteCabbage = "white cabbage",
  eggplant = "egg plant",
  heimoer = "heimoer",
  sweetPotato = "sweet potato",

  // salad
  salad = "salad",
  cherryTomatoes = "cherry tomatoes",
  avocado = "avocado",
  goatCheese = "goat cheese",
  olives = "olives",
  raisins = "raisins",
  cannedTuna = "tuna",

  // canned
  butternutSquash = "butternut squash",
  cannedCorn = "canned corn",
  cannedTomatoes = "canned tomatoes",
  coke = "coke",
  driedPeas = "dried peas",
  pineapple = "pineapple",
  lentils = "lentils",
  cannedBeans = "canned beans",
  japaneseCurryRoux = "japanese curry roux",
  tomatoPaste = "tomato paste",
  peaPasta = "pea pasta",
  lentilSpaghetti = "lentil spaghetti",
  morrocanSauce = "morrocan sauce",

  // fun
  pizzaCheese = "pizza cheese",
  mozarella = "mozarella",
  coconutWater = "cocunut water",

  //stock
  suancaiyuSauce = "suancaiyu sauce",
  coconutYog = "coconut yogurt",
  eggs = "eggs",
  chickenBroth = "chicken broth",
  tapiocaFlour = "tapiocaFlour",
  kimchi = "kimchi",
  cranberries = "cranberries",
  gochujang = "gochujang",
  zhacai = "zhacai",
}

export const discourageDuplicationFor = [
  I.chickenChunks,
  I.wholeChicken,
  I.porkStrips,
  I.porkBelly,
  I.stewPork,
  I.groundPork,
  I.sausage,
]

export const migrosOrder = [
  // early
  I.beanSprouts,
  I.tofu,
  I.salad,
  I.olives,

  //veg
  I.avocado,
  I.ginger,
  I.garlic,
  I.onion,
  I.qingjiao,
  I.mushrooms,
  I.cauliflower,
  I.greenBeans,
  I.flatBeans,
  I.springOnions,
  I.celery,
  I.potatoes,
  I.bigTomatoes,
  I.spinach,
  I.bokchoi,
  I.chineseCabbage,
  I.whiteCabbage,
  I.eggplant,
  I.sweetPotato,
  I.cherryTomatoes,

  // meat
  I.chickenChunks,
  I.wholeChicken,
  I.porkStrips,
  I.porkBelly,
  I.stewPork,
  I.groundPork,
  I.sausage,
  I.chorizo,
  I.chickenWings,
  I.ham,
  I.bacon,

  // dairy
  I.coconutYog,
  I.goatCheese,
  I.eggs,
  I.mozarella,
  I.pizzaCheese,

  // third
  I.cranberries,
  I.chickenBroth,
  I.raisins,
  I.cannedTuna,
  I.salmon,
  I.frozenSeafoodMix,
  I.bigShrimp,
  I.frozenSpinach,
  I.smallShrimp,
  I.frozenFish,
  I.driedMushrooms,
  I.lentilSpaghetti,
  I.peaPasta,
  I.cannedCorn,
  I.cannedTomatoes,
  I.coke,
  I.driedPeas,
  I.pineapple,
  I.lentils,
  I.cannedBeans,
  I.japaneseCurryRoux,
  I.tomatoPaste,
  I.peaPasta,
  I.morrocanSauce,
]

export const chineseSupermarketItems = [
  I.heimoer,
  I.fishBalls,
  I.japaneseCurryRoux,
  I.kimchi,
  I.gochujang,
  I.zhacai,
]

export const butcher = [I.porkNeck, I.duck, I.tigerShrimp, I.ribs]

export const itemQuantities = {
  [I.eggs]: 4,
  [I.bigTomatoes]: 3,
  [I.onion]: 2,
}
