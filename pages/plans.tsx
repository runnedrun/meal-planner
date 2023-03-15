import { creators, setters } from "@/data/fb"
import {
  buildComponentsForField,
  buildCustomDisplayComponents,
} from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { boolParam } from "@/data/paramObsBuilders/boolParam"
import { filtered } from "@/data/paramObsBuilders/filtered"
import { genPlan } from "@/functions/src/genPlan"
import { logObs } from "@/helpers/logObs"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { AdminPageLayout } from "@/page_helpers/admin/AdminPageLayout"
import { builDefaultDataViewFromFieldDisplays } from "@/page_helpers/admin/buildDataViewFromFieldDisplays"
import { sortAndRaiseNewItems } from "@/page_helpers/admin/sortAndRaiseNewItems"
import { buildPrefetchHandlerFromSingleObsFn } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"
import { Button } from "@mui/material"
import { map } from "rxjs"

const mealPlans = memoizeDataFunc(() =>
  filtered("mealPlan", {
    archived: boolParam("archived", false),
  }).pipe(map(sortAndRaiseNewItems("startOn")))
)

const MealPlansTable = builDefaultDataViewFromFieldDisplays(
  "mealPlan",
  mealPlans
)(
  {
    startOn: {
      components: buildComponentsForField("startOn"),
      type: "fbTimestamp",
    },
    open: {
      components: buildCustomDisplayComponents(({ row }) => {
        return <a href={`meal_plan/${row.uid}`}>Open</a>
      }),
    },
  },
  {
    newItemFn: () => {
      return creators.mealPlan(genPlan())
    },
  }
)
const MealPlansDisplay = rootComponent(() => (
  <AdminPageLayout title={`mealPlans`}>
    <MealPlansTable />
  </AdminPageLayout>
))

export const getServerSideProps = buildPrefetchHandlerFromSingleObsFn(mealPlans)

export default MealPlansDisplay
