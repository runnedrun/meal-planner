import { franc } from "franc"
import { iso6393To1 } from "iso-639-3"
iso6393To1["cmn"] = "zh" // Manually handle mainland Chinese language code without mapping

export const MIN_TEXT_LENGTH = 20

export function getLanguageForString(text: string) {
  const code = franc(text, { minLength: MIN_TEXT_LENGTH })
  const twoLetterCode = iso6393To1[code]
  const withFallbackCode = twoLetterCode ?? "en"

  return withFallbackCode
}

export function getLanguageForSentences(sentences: string[][]) {
  const allJoined = sentences.map((_) => _.join("")).join(" ")

  const sample = allJoined.slice(0, 1000)

  return getLanguageForString(sample)
}
