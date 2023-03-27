import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { filtered } from "@/data/paramObsBuilders/filtered"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { DayMeals } from "@/data/types/MealPlan"
import { Recipe } from "@/data/types/Recipe"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  TextField,
} from "@mui/material"
import moment from "moment"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Timestamp } from "firebase/firestore"
import { Close, Remove, ReplayCircleFilled } from "@mui/icons-material"
import { useState } from "react"
import { RecipeSelector } from "@/components/editable/RecipeSelector"
import { setters } from "@/data/fb"
import { prop } from "@/data/paramObsBuilders/prop"
import {
  butcher,
  chineseSupermarketItems,
  I,
  migrosOrder,
} from "@/data/types/Ingredients"
import { clone, sortBy } from "lodash-es"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { ReplyIcon } from "@heroicons/react/solid"

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
  const allIngredients = recipes.flatMap((_) => _.ingredients)
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
}: {
  recipe: Recipe
  replace: (newRecipe: Recipe) => Promise<void>
}) => {
  const [isReplacing, setIsReplacing] = useState(false)

  let display = (
    <div>
      <div className="text-lg font-extrabold">Replacing:</div>
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
          <div>
            <ReplayCircleFilled
              onClick={() => setIsReplacing(true)}
              fontSize="small"
            ></ReplayCircleFilled>
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

        <div>last used: {formatDate(recipe.lastUsedAt)}</div>
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
}: {
  dayMeals: DayMeals
  dayIndex: number
  dayStartMs: number
}) => {
  const buildReplaceFn = (recipeIndex: number) => async (newRecipe: Recipe) => {
    const thisPlan = await dataFn().mealPlan
    const days = thisPlan.days
    days[dayIndex].recipes[recipeIndex] = newRecipe
    setters.mealPlan(thisPlan.uid, { days })
  }
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="text-xl">
          Day {dayIndex}, {moment(dayStartMs).format(momentFormatString)}
        </div>
        <div className="flex-grow">: {dayMeals.score}</div>
        <div>
          <IconButton
            onClick={async () => {
              const thisPlan = await dataFn().mealPlan
              const days = thisPlan.days
              const newDays = days.filter((_, i) => i !== dayIndex)
              setters.mealPlan(thisPlan.uid, {
                days: newDays,
              })
            }}
          >
            <Close></Close>
          </IconButton>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        {dayMeals.recipes.map((recipe, index) => {
          return (
            <RecipeDisplay
              replace={buildReplaceFn(index)}
              recipe={recipe}
              key={index}
            ></RecipeDisplay>
          )
        })}
      </div>
    </div>
  )
}

const dayInMs = 24 * 60 * 60 * 1000
const AllDayMealsDisplay = ({
  daysMealsObjs,
  weekStartMs,
}: {
  daysMealsObjs: DayMeals[]
  weekStartMs: number
}) => {
  return (
    <div className="flex flex-col gap-5">
      {daysMealsObjs.map((dayMeals, dayIndex) => {
        const dayStartMs = weekStartMs + dayIndex * dayInMs
        return (
          <DayMealsDisplay
            key={dayMeals.dayIndex}
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
  mealPlan.days.forEach((day) => {
    copyableMealPlan += `\n<div>Day ${day.dayIndex}</div><ul>`
    day.recipes.forEach((recipe) => {
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

  console.log("copyableMealPlan", copyableMealPlan)

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
          <AllDayMealsDisplay
            weekStartMs={mealPlan.startOn?.toMillis()}
            daysMealsObjs={mealPlan.days}
          ></AllDayMealsDisplay>
        </div>
      </div>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler()(dataFn)

export default MealPlanDisplay
