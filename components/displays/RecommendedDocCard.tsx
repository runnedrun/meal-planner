import readingDuck from "@/public/images/reading_duck.png"
import Image from "next/image"
import { DisplayLangsIcons } from "./DisplayLangsIcons"

const BORDER_COLORS = [
  "border-gray-300",
  "border-current-300",
  "border-primary-300",
  "border-secondary-300",
]

const FIRST_SENTENCE_PREVIEW_LENGTH = 30

export const RecommendedDocCard = ({
  doc,
  languages,
}: {
  // TO-DO: add type for doc
  doc: any
  languages: string[]
}) => {
  const randomBorder =
    BORDER_COLORS[Math.floor(Math.random() * BORDER_COLORS.length)]
  return (
    <div>
      <a href={"/web_reader/" + doc.uid}>
        <figure
          className={`flex h-full w-44 flex-col justify-between rounded border bg-white p-4 drop-shadow-md hover:border-2 hover:drop-shadow-xl ${randomBorder}`}
        >
          {doc.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.cover.url}
              className="my-1 self-center rounded-xl drop-shadow-lg"
              alt="book cover"
              width={150}
              height={150}
            />
          ) : (
            <Image
              src={readingDuck}
              className="my-1 self-center rounded-xl drop-shadow-lg"
              alt="book cover"
              width={150}
              height={150}
            />
          )}
          <div className="mt-2 break-normal">
            <h3 className="text font-bold">{doc.title}</h3>
            <p className="mb-2 italic">{doc.author}</p>
          </div>
          {/* <p className="mb-2">
            {doc.firstSentence?.text.slice(0, FIRST_SENTENCE_PREVIEW_LENGTH) +
              "..."}
          </p> */}
          <DisplayLangsIcons langs={languages} />
        </figure>
      </a>
    </div>
  )
}
