import { buildObsForDoc } from "@/data/builders/buildObsForDoc"
import { from, MonoTypeOperatorFunction, Observable, of, switchMap } from "rxjs"
import { creators } from "../fb"
import { CollectionModels } from "../firebaseObsBuilders/CollectionModels"

export const createIfNotExists =
  <CollectionName extends keyof CollectionModels>(
    collectionName: CollectionName,
    defaultValuePromise: Observable<CollectionModels[CollectionName]>
  ): MonoTypeOperatorFunction<CollectionModels[CollectionName]> =>
  (obs) => {
    return obs.pipe(
      switchMap((value) => {
        return defaultValuePromise.pipe(
          switchMap((defaultValue) => {
            if (value || !defaultValue) {
              return of(value)
            } else {
              const refPromise = creators[collectionName](defaultValue, {
                id: defaultValue.uid,
              })
              const createAndListenObs = from(refPromise).pipe(
                switchMap((ref) => {
                  const uid = ref.id
                  return buildObsForDoc(collectionName, uid) as Observable<
                    CollectionModels[CollectionName]
                  >
                })
              )
              return createAndListenObs
            }
          })
        )
      })
    )
  }
