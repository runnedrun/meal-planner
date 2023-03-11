import { getAbsoluteUrl } from "@/helpers/getAbsoluteUrl"
import { GetServerSidePropsContext } from "next"

export const redirectWithDestination =
  (path: string) =>
  ({ ctx }: { ctx: GetServerSidePropsContext }) => {
    const absUrl = getAbsoluteUrl(ctx)
    if (!absUrl) {
      return path
    }
    return `${path}?destination=${encodeURIComponent(absUrl.toString())}`
  }
