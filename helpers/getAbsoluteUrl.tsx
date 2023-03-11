import { GetServerSidePropsContext } from "next"
import absoluteUrl from "next-absolute-url"
import { isServerside } from "./isServerside"

export const getAbsoluteUrl = (ctx: GetServerSidePropsContext): URL => {
  if (!ctx && isServerside()) {
    return new URL("/", "http://localhost:3000")
  }

  const origin = isServerside()
    ? absoluteUrl(ctx.req).origin
    : window.location.origin
  const destPath =
    typeof window === "undefined" ? ctx.resolvedUrl : window.location.href
  return new URL(destPath, origin)
}
