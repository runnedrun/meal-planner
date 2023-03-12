import moment from "moment"
import { genIdealMealPlan } from "./helpers/genMealPlan"
import { testRecipes } from "./test_data/testRecipes"

export const genPlan = () => {
  const now = moment()
  const todayStart = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const plan = genIdealMealPlan(testRecipes, todayStart.valueOf())

  const flatPlan = plan.flatMap((dayMeals) => {
    return [dayMeals.veg, ...dayMeals.other]
  })

  console.log("run plan", plan, flatPlan)
}
