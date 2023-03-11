import { AllModels } from "@/data/firebaseObsBuilders/CollectionModels"
import { Model } from "@/data/baseTypes/Model"
import { getFirestore } from "firebase-admin/firestore"
import { Timestamp } from "firebase-admin/firestore"
import { chunk } from "lodash-es"
import batchPromises from "batch-promises"
import { Timestamp as FeTimestamp } from "firebase/firestore"

export const genExtraData = () => {
  return {
    createdAt: Timestamp.now() as FeTimestamp,
    updatedAt: Timestamp.now() as FeTimestamp,
    archived: false,
  }
}

export const backendNow = () => Timestamp.now() as FeTimestamp //Timestamp.now() as FeTimestamp

export const fbSet = <CollectionName extends keyof AllModels>(
  collectionName: CollectionName,
  docId: string,
  data: Partial<AllModels[CollectionName]>
) => {
  const firestore = getFirestore()

  return firestore
    .collection(collectionName)
    .doc(docId)
    .set(
      {
        updatedAt: Timestamp.now(),
        ...data,
      },
      { merge: true }
    )
}

export const fbUpdate = <CollectionName extends keyof AllModels>(
  collectionName: CollectionName,
  docId: string,
  data: Partial<AllModels[CollectionName]>
) => {
  const firestore = getFirestore()

  return firestore
    .collection(collectionName)
    .doc(docId)
    .update({
      updatedAt: Timestamp.now(),
      ...data,
    })
}

export const fbCreate = async <Key extends keyof AllModels>(
  collectionName: Key,
  data: Omit<AllModels[Key], keyof Model<any, any>>
) => {
  const firestore = getFirestore()
  const ref = firestore.collection(collectionName).doc()
  await ref.set({
    ...genExtraData(),
    ...data,
  })
  return ref
}

export const fbBatchSet = async <CollectionName extends keyof AllModels>(
  collectionName: CollectionName,
  records: AllModels[CollectionName][],
  getDocKey?: (record: AllModels[CollectionName], i: number) => string,
  batchSize: number = 100
) => {
  const firestore = getFirestore()
  const chunked = chunk(records, batchSize)
  const entries = Array.from(chunked.entries())

  console.log(`starting ${collectionName} save for ${records.length} documents`)

  return batchPromises(
    5,
    entries,
    async ([batchIndex, sentenceBatch]: [
      number,
      AllModels[CollectionName][]
    ]) => {
      const writer = firestore.batch()
      sentenceBatch.forEach((record, sentenceIndex) => {
        const recordToWrite = {
          ...record,
          ...genExtraData(),
        } as AllModels[CollectionName]

        const recordRef = getDocKey
          ? firestore
              .collection(collectionName)
              .doc(getDocKey(record, sentenceIndex + batchIndex * batchSize))
          : firestore.collection(collectionName).doc()

        writer.set(recordRef, recordToWrite)
      })
      console.log(
        `commiting ${collectionName} batch ${batchIndex} out of ${chunked.length}`
      )
      return writer.commit()
    }
  )
}
