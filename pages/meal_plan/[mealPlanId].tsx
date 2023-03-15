import { docForKey } from "@/data/firebaseObsBuilders/docForKey"
import { filtered } from "@/data/paramObsBuilders/filtered"
import { stringParam } from "@/data/paramObsBuilders/stringParam"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { component } from "@/views/view_builder/component"
import moment from "moment"

const dataFn = () => {
  return {
    mealPlan: docForKey("mealPlan", stringParam("mealPlanId")),
  }
}

const MealPlanDisplay = component(dataFn, ({ mealPlan }) => {
  const momentFormatString = "dddd, MMMM Do YYYY"
  return (
    <div className="mt-5 ml-5 text-lg">
      Plan for week starting on{" "}
      {moment(mealPlan.startOn.toMillis()).format(momentFormatString)}
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler()(dataFn)

export default MealPlanDisplay
