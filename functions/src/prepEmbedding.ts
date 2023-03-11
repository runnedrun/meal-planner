import { DocumentFile, DocumentVersion } from "@/data/types/DocumentVersion"
import axios from "axios"
import axiosRetry from "axios-retry"
import batchPromises from "batch-promises"
import { segment as segmentZh } from "hanzi-tools" // Chinese pronunciation
import { chunk } from "lodash-es"
import TinySegmenter from "tiny-segmenter"
import { getTextFile, uploadTextFile } from "./helpers/fileHelpers"
import { getLanguageForString } from "./helpers/getLanguageForSentences"
import { fbSet } from "./helpers/writer"
const jaSegmenter = new TinySegmenter() // インスタンス生成
const segmentJa = (_) => jaSegmenter.segment(_)

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return true
  },
  onRetry: (error) => {
    console.log("retrying!")
  },
})

const embeddingsUrl =
  "https://sent-similarity-server-b5j4e5pysa-uc.a.run.app/encode-sentences"

// const embeddingsUrl =
//   "https://runnedrun-didactic-eureka-xgr9w667rc6x96-5000.preview.app.github.dev/encode-sentences"

const shortenLongSentences = (
  sentences: string[],
  maxSentenceLength: number = 1000
) => {
  const backupSplitted = sentences.map((sentence) => {
    if (sentence.length > maxSentenceLength) {
      console.log(
        "USING BACK UP SHORTENER",
        sentence.length,
        sentence.slice(0, 1500)
      )
      const splitted = sentence.split(/.。」/g)
      const finalSplit = splitted
        .map((sentence) => {
          if (sentence.length > maxSentenceLength) {
            return chunk(sentence, maxSentenceLength).map((chunk) =>
              chunk.join("")
            )
          } else {
            return sentence
          }
        })
        .flat()
      return finalSplit
    } else {
      return [sentence]
    }
  })
  return backupSplitted.flat()
}

export const splitText = (text: string, langCode: string) => {
  const segmenter = new (Intl as any).Segmenter(langCode, {
    granularity: "sentence",
  })

  const sentences = Array.from(segmenter.segment(text), (s: any) => s.segment)
  return sentences as string[]
}

// todo: save paragraph indices in a separate document, so as not to interfere with translation or embedding
// const PILCROW = "¶" // paragraph symbol
const cleanTextPreSplit = (text: string) => {
  // Add a pilcrow to the end of non-blank sentences that end with a newline
  // const withPilcrow = /^.+(\r\n|\n|\r)$/.test(sentence.trimStart())
  //   ? sentence + PILCROW
  //   : sentence

  // Remove newlines and extra spaces and fix quotes

  const noDoubleSpacesRegex = /[^\S\r\n]{2,}/g

  const clean = text
    .replace(/&quot;/g, '"')
    .replace(/<br \/>/g, "\n")
    .replace(/“/g, '"')
    .replace(/…+/g, "...")
    .replace(/\.{3,}/g, "...")
    .replace(noDoubleSpacesRegex, " ")

  // Return the cleaned sentence, or null if it's blank
  return clean.trim() ? clean : null
}

const cleanSentencesPostSplit = (sentences: string[]) => {
  return sentences
    .map((_) => {
      return removeNewLines(_).replace(/^\s+$/, "")
    })
    .filter(Boolean)
}

const getWordsFromSegmenter = (
  segmenter: Intl.Segmenter,
  sentence: string
): string[] => {
  return Array.from(segmenter.segment(sentence), (s: any) => s.segment)
}

const getSegmentFn = (langCode: string) => {
  const segmenter = new Intl.Segmenter(langCode, {
    granularity: "word",
  })

  return (sentence: string) => getWordsFromSegmenter(segmenter, sentence)
}

export const getWordsFromSentence = (
  sentence: string,
  languageCode: string
): string[] => {
  if (languageCode === "zh") {
    return segmentZh(sentence)
  } else if (languageCode === "ja") {
    return segmentJa(sentence)
  } else {
    return getSegmentFn(languageCode)(sentence)
  }
}

export const getSentences = (text: string) => {
  const cleanText = cleanTextPreSplit(text)
  const langCode = getLanguageForString(text)
  const results = splitText(cleanText, langCode)
  const shortenedResults = shortenLongSentences(results.filter(Boolean))
  const finalResults = cleanSentencesPostSplit(shortenedResults)

  return finalResults as string[]
}

export const getSentsAndWords = (text: string) => {
  const langCode = getLanguageForString(text)
  const sentences = getSentences(text)
  const splitWords = sentences.map((_) => getWordsFromSentence(_, langCode))

  return splitWords as string[][]
}

const getEmbeddingFileName = (versionKey: string) => {
  return `version-embeddings/${versionKey}.json`
}

export const uploadEmbeddingFile = async (
  embeddings: number[][],
  versionKey: string
) => {
  const embeddingsJson = JSON.stringify(embeddings)
  const fileName = getEmbeddingFileName(versionKey)
  await uploadTextFile(fileName, embeddingsJson)
  const fileObj = { internalPath: fileName } as DocumentFile
  await fbSet("documentVersion", versionKey, {
    embeddingFile: fileObj,
  } as DocumentVersion)
  return fileObj
}

export const getEmbeddingsFromFile = async (filename: string) => {
  const text = await getTextFile(filename)
  return JSON.parse(text) as number[][]
}

export const getEmbeddings = async (sentences: string[]) => {
  const chunked = chunk(sentences, 150)
  const entries = Array.from(Object.entries(chunked))
  const embeddings = [] as number[][]
  await batchPromises(
    5,
    entries,
    async ([batchIndex, sentenceBatch]: [number, string[]]) => {
      const embeddingResp = await axios.post(embeddingsUrl, {
        paragraphs: [sentenceBatch],
      })

      const json = embeddingResp.data
      const results = json.results.embeddings[0] as number[][]
      sentenceBatch.forEach((setenceText, sentenceIndex) => {
        embeddings[Number(batchIndex) + Number(sentenceIndex)] =
          results[sentenceIndex]
      })
    }
  )

  return embeddings
}

const removeNewLines = (text: string) => {
  return text.replace(/(\r\n|\n|\r)/gm, " ")
}
