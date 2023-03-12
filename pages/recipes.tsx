import { creators, setters } from "@/data/fb"
import { buildComponentsForField } from "@/data/fieldDisplayComponents/fieldDisplayComponentsBuilders"
import { boolParam } from "@/data/paramObsBuilders/boolParam"
import { filtered } from "@/data/paramObsBuilders/filtered"
import { logObs } from "@/helpers/logObs"
import { memoizeDataFunc } from "@/helpers/memoizeDataFunc"
import { AdminPageLayout } from "@/page_helpers/admin/AdminPageLayout"
import { builDefaultDataViewFromFieldDisplays } from "@/page_helpers/admin/buildDataViewFromFieldDisplays"
import { sortAndRaiseNewItems } from "@/page_helpers/admin/sortAndRaiseNewItems"
import { buildPrefetchHandlerFromSingleObsFn } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"
import { map } from "rxjs"

const recipes = memoizeDataFunc(() =>
  filtered("recipe", {
    archived: boolParam("archived", false),
  }).pipe(map(sortAndRaiseNewItems("name")), logObs("recipes"))
)

const CompaniesDataTable = builDefaultDataViewFromFieldDisplays(
  "recipe",
  recipes
)(
  {
    name: {
      components: buildComponentsForField("name"),
    },
  },
  { newItemFn: () => creators.recipe({ name: "New Recipe" }) }
)
const RecipesDisplay = rootComponent(() => (
  <AdminPageLayout title={`Recipes`}>
    <CompaniesDataTable />
  </AdminPageLayout>
))

export const getServerSideProps = buildPrefetchHandlerFromSingleObsFn(recipes)

export default RecipesDisplay
