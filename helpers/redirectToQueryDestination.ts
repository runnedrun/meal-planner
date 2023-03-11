import { GetServerSidePropsContext } from "next"
import absoluteUrl from "next-absolute-url"

interface Props {
  ctx?: GetServerSidePropsContext<any>
}
export const redirectToQueryDestination = ({ ctx }: Props) => {
  if (!ctx) {
    return ""
  }
  const origin = absoluteUrl(ctx.req).origin

  const params = new URL(ctx.req.url, origin).searchParams

  const destinationParamVal = params.get("destination")
    ? decodeURIComponent(params.get("destination"))
    : undefined

  return destinationParamVal
}
