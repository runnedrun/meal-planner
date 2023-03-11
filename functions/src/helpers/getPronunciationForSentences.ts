import { SentenceRecord, Word } from "@/data/types/SentenceRecord"
import { HanziTools } from "@elyse0/hanzi-tools"
import { pinyinify } from "hanzi-tools"
import * as KuroshiroObject from "kuroshiro" // Japanese pronunciation
import * as KuromojiAnalyzerObject from "kuroshiro-analyzer-kuromoji" // Japanese pronunciation
import { clone, cloneDeep, escapeRegExp } from "lodash-es"
const Kuroshiro = KuroshiroObject.default.default
const KuromojiAnalyzer = KuromojiAnalyzerObject.default

type Pronouncer = (text: SentenceRecord) => Promise<SentenceRecord>

const pronouncerBuilders = {
  ja: () => {
    const kuroshiro = new Kuroshiro()
    const initPromise = kuroshiro.init(new KuromojiAnalyzer())
    return [
      async (sentence) => {
        await initPromise
        const sentenceText = await kuroshiro.convert(sentence.text, {
          to: "hiragana",
          mode: "furigana",
        })
        const existingPronunciations = sentence.pronunciations || {}
        existingPronunciations["furigana"] = {
          pronunciation: sentenceText,
          label: "furigana",
        }
        return {
          ...sentence,
          pronunciations: existingPronunciations,
        }
      },
    ]
  },
  zh: () => [
    (sentence) => {
      const sentenceClone = cloneDeep(sentence)
      const sentencePronunciation = pinyinify(
        sentence.text,
        true
      ) as HanziTools.PinyinDetailed

      const pronunciationWordsArray = sentencePronunciation.pinyinSegments
      const pronunciationSentence = sentencePronunciation.pinyin
      let pronunciationSentenceCopy = clone(pronunciationSentence)

      sentenceClone.words.forEach((word, index) => {
        const pronunciationWord = pronunciationWordsArray[index]
        const findWithSpaceRegex = new RegExp(
          `${escapeRegExp(pronunciationWord)}\\s`
        )
        const matchIndex = pronunciationSentenceCopy.search(findWithSpaceRegex)
        const spaceCharacter = matchIndex === -1 ? "" : " "

        if (spaceCharacter) {
          const prefix = pronunciationSentenceCopy.slice(0, matchIndex)
          const suffix = pronunciationSentenceCopy.slice(
            matchIndex + pronunciationWord.length + spaceCharacter.length
          )
          pronunciationSentenceCopy = prefix + suffix
        }

        word.pronunciations = {
          pinyin: {
            label: "pinyin",
            pronunciation: pronunciationWord + spaceCharacter,
          },
        }
      })

      return Promise.resolve({
        ...sentenceClone,
        pronunciations: {
          pinyin: {
            pronunciation: sentencePronunciation.pinyin,
            label: "pinyin",
          },
        },
      })
    },
  ],
} as Record<string, () => Pronouncer[]>

export const getPronunciationForSentences = async (
  sentences: SentenceRecord[],
  langCode: string
): Promise<SentenceRecord[]> => {
  const pronouncerBuilder = pronouncerBuilders[langCode]

  if (!pronouncerBuilder) {
    return sentences
  }

  const pronouncers = pronouncerBuilder()

  const newSentences = await Promise.all(
    sentences.map(async (sentence) => {
      // a cleaner solution is to have these functions in the pronouncers object
      const newSentence = await pronouncers.reduce(
        (accSentence, pronouncer) => accSentence.then(pronouncer),
        Promise.resolve(sentence)
      )
      return newSentence
    })
  )

  return newSentences
}
