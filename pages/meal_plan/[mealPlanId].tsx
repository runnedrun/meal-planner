import { buildRecipeSelector } from "@/components/editable/buildRecipeSelector"
import { setters } from "@/data/fb"
import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import {
  butcher,
  chineseSupermarketItems,
  I,
  migrosOrder,
} from "@/data/types/Ingredients"
import { DayMeals, MealPlan } from "@/data/types/MealPlan"
import { Recipe } from "@/data/types/Recipe"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import {
  Cancel,
  CancelOutlined,
  Close,
  ReplayCircleFilled,
  Undo,
} from "@mui/icons-material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  TextField,
} from "@mui/material"
import { arrayRemove, Timestamp } from "firebase/firestore"
import { clone, sortBy } from "lodash-es"
import moment from "moment"
import { useState } from "react"

const dataFn = () => {
  return {
    mealPlan: docForKey("mealPlan", stringParam("mealPlanId")),
  }
}

const momentFormatString = "dddd, MMMM Do YYYY"
const formatDate = (timestamp: Timestamp) => {
  return timestamp
    ? moment(timestamp.toMillis()).format(momentFormatString)
    : "Never"
}

const getAndSortForStore = (storeItemsList: I[], allRecipeIngredients: I[]) => {
  const sorted = sortBy(
    allRecipeIngredients.filter((_) => storeItemsList.includes(_)),
    (_) => storeItemsList.indexOf(_)
  )
  const combinedAndStringified = []
  for (let i = 0; i < sorted.length; i++) {
    const ingredient = sorted[i]
    const nDups = sorted.filter((_) => _ === ingredient).length
    const dupsStr = nDups > 1 ? `${nDups} x ` : ""
    combinedAndStringified.push(`${dupsStr}${ingredient}`)
    i += nDups - 1
  }

  return combinedAndStringified
}

const ShoppingListDisplay = ({ recipes }: { recipes: Recipe[] }) => {
  const allIngredients = recipes.filter(Boolean).flatMap((_) => _.ingredients)
  const migrosIngredients = getAndSortForStore(migrosOrder, allIngredients)
  const butcherIngredients = getAndSortForStore(butcher, allIngredients)
  const chineseIngredients = getAndSortForStore(
    chineseSupermarketItems,
    allIngredients
  )

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-lg">Migros</div>
        {migrosIngredients.map((ingredient, i) => {
          return <div key={i}>{ingredient}</div>
        })}
      </div>
      <div>
        <div className="text-lg">Butcher</div>
        {butcherIngredients.map((ingredient, i) => {
          return <div key={i}>{ingredient}</div>
        })}
      </div>
      <div>
        <div className="text-lg">Chinese Supermarket</div>
        {chineseIngredients.map((ingredient, i) => {
          return <div key={i}>{ingredient}</div>
        })}
      </div>
    </div>
  )
}

const RecipeDisplay = ({
  recipe,
  replace,
  RecipeSelector,
}: {
  recipe: Recipe
  replace: (newRecipe: Recipe) => void
  RecipeSelector: React.FC<{ update: (recipe: Recipe) => void }>
}) => {
  const [isReplacing, setIsReplacing] = useState(false)

  let display = (
    <div>
      <div className="flex items-center">
        <div className="text-lg font-extrabold">Replacing:</div>
        <div>
          <IconButton onClick={() => setIsReplacing(false)}>
            <Cancel></Cancel>
          </IconButton>
        </div>
      </div>
      <RecipeSelector
        update={(recipe) => {
          replace(recipe)
          setIsReplacing(false)
        }}
      ></RecipeSelector>
    </div>
  )

  if (!isReplacing) {
    display = (
      <div className="flex max-w-md flex-col gap-2">
        <div className="flex justify-between">
          <div className="text-lg font-extrabold">{recipe.name}</div>
          <div className="flex gap-2">
            <ReplayCircleFilled
              onClick={() => setIsReplacing(true)}
              fontSize="small"
              className="cursor-pointer"
            ></ReplayCircleFilled>
            <CancelOutlined
              className="cursor-pointer"
              onClick={() => replace(null)}
              fontSize="small"
            ></CancelOutlined>
          </div>
        </div>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <div>Ingredients</div>
          </AccordionSummary>
          <AccordionDetails>
            <div className="flex flex-col gap-2">
              {recipe.ingredients?.map((ingredient) => {
                return <div key={ingredient}>{ingredient}</div>
              })}
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion className="w-full">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <div>Notes</div>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              onChange={(e) => {
                replace({
                  ...recipe,
                  notes: e.target.value,
                })
              }}
              defaultValue={recipe.notes}
              className="flex flex-col gap-2"
            ></TextField>
          </AccordionDetails>
        </Accordion>

        <div className="flex gap-2">
          <div>XQ: {recipe.xqScore || 2.5}</div>
          <div>DG: {recipe.dgScore || 2.5}</div>
        </div>
      </div>
    )
  }

  return display
}

const DayMealsDisplay = ({
  dayMeals,
  dayIndex,
  dayStartMs,
  thisMealPlan,
}: {
  dayMeals: DayMeals
  dayIndex: number
  dayStartMs: number
  thisMealPlan: MealPlan
}) => {
  const buildGetNewDaysForPlan =
    (recipeIndex: number) => (newRecipe: Recipe) => {
      const days = clone(thisMealPlan.days)
      days[dayIndex].recipes[recipeIndex] = newRecipe
        ? {
            ...newRecipe,
            usedOn: Timestamp.fromMillis(dayStartMs),
          }
        : null
      return days
    }
  const buildReplaceFn = (recipeIndex: number) => (newRecipe: Recipe) => {
    const newDays = buildGetNewDaysForPlan(recipeIndex)(newRecipe)
    setters.mealPlan(thisMealPlan.uid, { days: newDays })
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="grow text-xl">
          Day {dayIndex + 1}, {moment(dayStartMs).format(momentFormatString)}
        </div>
        {/* <div className="flex-grow">: {dayMeals.score}</div> */}
        <div>
          <IconButton
            onClick={async () => {
              const thisPlan = await dataFn().mealPlan
              const days = clone(thisPlan.days)
              days[dayIndex].ignored = true
              setters.mealPlan(thisPlan.uid, {
                days,
              })
            }}
          >
            <Close></Close>
          </IconButton>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {dayMeals.recipes.map((recipe, index) => {
          if (!recipe) {
            return <span key={index} className="hidden"></span>
          }

          const RecipeSelector = buildRecipeSelector(
            buildGetNewDaysForPlan(index),
            thisMealPlan.startOn.toMillis()
          )

          return (
            <RecipeDisplay
              recipe={recipe}
              key={index}
              replace={buildReplaceFn(index)}
              RecipeSelector={RecipeSelector as any}
            ></RecipeDisplay>
          )
        })}
      </div>
    </div>
  )
}

const dayInMs = 24 * 60 * 60 * 1000
const AllDayMealsDisplay = ({ thisMealPlan }: { thisMealPlan: MealPlan }) => {
  return (
    <div className="flex flex-col gap-5">
      {thisMealPlan.days.map((dayMeals, dayIndex) => {
        const dayStartMs = thisMealPlan.startOn.toMillis() + dayIndex * dayInMs
        if (dayMeals.ignored) {
          return (
            <div className="flex items-center gap-2" key={dayIndex}>
              <div className="text-lg font-bold">
                Day {dayIndex + 1} ignored
              </div>
              <IconButton
                onClick={() => {
                  const daysClone = clone(thisMealPlan.days)
                  daysClone[dayIndex].ignored = false
                  setters.mealPlan(thisMealPlan.uid, {
                    days: daysClone,
                  })
                }}
              >
                <Undo></Undo>
              </IconButton>
            </div>
          )
        }
        return (
          <DayMealsDisplay
            thisMealPlan={thisMealPlan}
            key={dayIndex}
            dayMeals={dayMeals}
            dayIndex={dayIndex}
            dayStartMs={dayStartMs}
          ></DayMealsDisplay>
        )
      })}
    </div>
  )
}

const MealPlanDisplay = component(dataFn, ({ mealPlan }) => {
  let copyableMealPlan = ""
  mealPlan.days.forEach((day, i) => {
    copyableMealPlan += `\n<div>Day ${i}</div><ul>`
    day.recipes.filter(Boolean).forEach((recipe) => {
      console.log("reicpes", recipe)
      copyableMealPlan += `<li><div>${recipe.name}</div><ul>`
      if (recipe.notes) {
        copyableMealPlan += `<li><ul><li>${recipe.notes}</li></ul></li>`
      }

      recipe.ingredients.forEach((ingredient) => {
        copyableMealPlan += `<li>${ingredient}</li>`
      })
      copyableMealPlan += `</ul>`
    })
    copyableMealPlan += `</ul>`
  })

  return (
    <div className="flex w-full justify-center">
      <div>
        <div className="mt-5 mb-5 max-w-xl text-lg">
          Plan for week starting on {formatDate(mealPlan.startOn)}
        </div>
        <div>
          {/* <CopyToClipboard
            options={{ format: "text/html" }}
            text={copyableMealPlan}
          > */}
          <Button
            onClick={async () => {
              const htmlBlob = new Blob([copyableMealPlan], {
                type: "text/html",
              })
              const textBlob = new Blob([copyableMealPlan], {
                type: "text/plain",
              })
              const data = [
                new ClipboardItem({
                  "text/html": htmlBlob,
                  "text/plain": textBlob,
                }),
              ]
              await navigator.clipboard.write(data)
            }}
          >
            Copy Meal Plan
          </Button>
          {/* </CopyToClipboard> */}
        </div>
        <div className="pb-5">
          <Accordion className="w-full">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <div>Shopping List</div>
            </AccordionSummary>
            <AccordionDetails>
              <ShoppingListDisplay
                recipes={mealPlan.days.flatMap((day) => day.recipes)}
              ></ShoppingListDisplay>
            </AccordionDetails>
          </Accordion>
        </div>
        <div>
          <AllDayMealsDisplay thisMealPlan={mealPlan}></AllDayMealsDisplay>
        </div>
      </div>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler()(dataFn)

export default MealPlanDisplay
