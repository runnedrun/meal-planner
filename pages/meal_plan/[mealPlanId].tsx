import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { filtered } from "@/data/paramObsBuilders/filtered"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { DayMeals } from "@/data/types/MealPlan"
import { Recipe } from "@/data/types/Recipe"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material"
import moment from "moment"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Timestamp } from "firebase/firestore"
import { ReplayCircleFilled } from "@mui/icons-material"
import { useState } from "react"
import { RecipeSelector } from "@/components/editable/RecipeSelector"
import { setters } from "@/data/fb"
import { prop } from "@/data/paramObsBuilders/prop"

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
      <div className="flex flex-col gap-2">
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
      <div className="flex gap-2">
        <div className="text-xl">
          Day {dayIndex}, {moment(dayStartMs).format(momentFormatString)}
        </div>
        <div>: {dayMeals.score}</div>
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
  return (
    <div className="flex w-full justify-center">
      <div>
        <div className="mt-5 mb-5 max-w-xl text-lg">
          Plan for week starting on {formatDate(mealPlan.startOn)}
        </div>
        <div>
          <AllDayMealsDisplay
            weekStartMs={mealPlan.startOn.toMillis()}
            daysMealsObjs={mealPlan.days}
          ></AllDayMealsDisplay>
        </div>
      </div>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler()(dataFn)

export default MealPlanDisplay
