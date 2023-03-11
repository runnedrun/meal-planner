import { isEqual, isUndefined } from "lodash-es"
import { filter, map, Observable, pairwise, startWith } from "rxjs"
import {
  DataWithLoading,
  ModelTypeFromDataWithLoading,
} from "../ParamaterizedObservable"

export const distinctWithLoading =
  <DataType extends DataWithLoading<any, any>>(
    equalityCheck: (
      a: ModelTypeFromDataWithLoading<DataType>,
      b: ModelTypeFromDataWithLoading<DataType>
    ) => boolean = isEqual
  ) =>
  (obs: Observable<DataType>) => {
    return obs.pipe(
      startWith(undefined as DataType),
      pairwise(),
      filter(([prev, curr]) => {
        const prevValue = isUndefined(prev?.finalValue)
          ? undefined
          : prev?.finalValue ?? null

        const currValue = isUndefined(curr?.finalValue)
          ? undefined
          : curr?.finalValue

        const shouldSkipFinalValueBecauseEqual =
          equalityCheck(prevValue, currValue) && !isUndefined(prev?.finalValue)

        return !shouldSkipFinalValueBecauseEqual
      }),
      map(([_, curr]) => curr)
    )
  }
