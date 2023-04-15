import { AnyGenericModel } from "@/data/baseTypes/Model"
import { sortBy } from "lodash-es"
import moment from "moment"

export const sortAndRaiseNewItems =
  <ModelType extends AnyGenericModel>(nameKey?: string) =>
  (items: ModelType[]) => {
    const recentlyCreated = sortBy(
      items.filter(
        (company) =>
          Date.now() - company.createdAt.toMillis() <
          moment.duration(10, "minutes").asMilliseconds()
      ),
      (_) => -1 * _.createdAt.toMillis()
    )

    const sorted = nameKey
      ? items.sort((a, b) => a[nameKey].localeCompare(b[nameKey]))
      : sortBy(items, (_) => -1 * _.createdAt.toMillis())

    const deduped = sorted.filter(
      (nameSorted) =>
        !recentlyCreated.find((timeSorted) => timeSorted.uid === nameSorted.uid)
    )
    return recentlyCreated.concat(deduped)
  }
