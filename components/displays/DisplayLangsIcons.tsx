import { HTMLAttributes } from "react"

const LANGS_TO_DISPLAY = 3

export const DisplayLangsIcons = ({
  langs,
  ...rest
}: { langs: string[] } & HTMLAttributes<HTMLDivElement>) => {
  return langs[0] ? (
    <div className="flex" {...rest}>
      <div className="mr-2 border-r">
        <span className="mr-2 rounded-sm border border-gray-300 bg-secondary-100 p-1 text-sm">
          {langs[0].toUpperCase()}
        </span>
      </div>
      <div>
        <p>
          {langs.length > LANGS_TO_DISPLAY ? (
            <>
              <span className="mr-2 rounded-sm border border-gray-300 bg-current-50 p-1 text-sm">
                {langs[1].toUpperCase()}
              </span>
              <span className="mr-2 rounded-sm border border-gray-300 bg-current-50 p-1 text-sm">
                {langs[2].toUpperCase()}
              </span>
              <span className="mr-2 rounded-sm border border-gray-300 bg-current-50 p-1 text-sm">
                +{langs.length - LANGS_TO_DISPLAY}
              </span>
            </>
          ) : (
            langs.map((lang, index) => {
              return (
                index !== 0 && (
                  <span
                    className="mr-2 rounded-sm border border-gray-300 bg-current-50 p-1 text-sm"
                    key={index}
                  >
                    {lang.toUpperCase()}
                  </span>
                )
              )
            })
          )}
        </p>
      </div>
    </div>
  ) : null
}
