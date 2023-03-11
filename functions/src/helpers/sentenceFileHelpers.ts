import { DocumentFile } from "@/data/types/DocumentVersion"
import { getSentsAndWords } from "../prepEmbedding"
import { genSentenceRecordWithoutPronunciation } from "../triggers/versionBuildSteps"
import { getTextFile, uploadTextFile } from "./fileHelpers"
import { fbSet } from "./writer"

const sentenceFileSplitToken = "[[SPLIT_SENT]]"
const wordSplitToken = "[[SPLIT_WORD]]"

const getSentenceFileFileName = (versionKey: string) =>
  `version-sentences/${versionKey}`

export const uploadSentenceFile = async (
  sentences: string[][],
  versionKey: string
) => {
  const fileName = getSentenceFileFileName(versionKey)
  const sentencesAndWordsWithSplitTokens = sentences
    .map((words) => words.join(wordSplitToken))
    .join(sentenceFileSplitToken)
  await uploadTextFile(fileName, sentencesAndWordsWithSplitTokens)
  const fileObj = { internalPath: fileName } as DocumentFile
  await fbSet("documentVersion", versionKey, {
    sentenceFile: fileObj,
  })
  return fileObj
}

export const getAndCacheSentences = async (
  lang1Text: string,
  versionKey: string
) => {
  const sentences = getSentsAndWords(lang1Text)
  return uploadSentenceFile(sentences, versionKey)
}

export const getSentencesFromInternalFilename = async (filename: string) => {
  const text = await getTextFile(filename)
  const sentences = text
    .split(sentenceFileSplitToken)
    .map((setenceWithWordSplitTokens) =>
      setenceWithWordSplitTokens.split(wordSplitToken)
    )
  return sentences
}
