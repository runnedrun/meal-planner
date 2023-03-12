import { AnyGenericModel } from "@/data/baseTypes/Model"
import moment from "moment"

export const sortAndRaiseNewItems =
  <ModelType extends AnyGenericModel>(nameKey: string) =>
  (items: ModelType[]) => {
    const recentlyCreated = items.filter(
      (company) =>
        Date.now() - company.createdAt.toMillis() <
        moment.duration(10, "minutes").asMilliseconds()
    )
    const sortedByName = items
      .sort((a, b) => a[nameKey].localeCompare(b[nameKey]))
      .filter(
        (nameSorted) =>
          !recentlyCreated.find(
            (timeSorted) => timeSorted.uid === nameSorted.uid
          )
      )
    return recentlyCreated.concat(sortedByName)
  }
