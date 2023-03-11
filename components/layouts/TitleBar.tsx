import { Logo } from "@/utils/logo"
import Link from "next/link"
import { HTMLAttributes } from "react"

const TitleBarComponent = ({
  home,
  ...rest
}: { home: boolean } & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...rest}>
      <Link href="/" passHref className="flex items-center">
        <Logo home={home} />
        <h2 className="ml-2 text-xl font-medium text-white">Yomuya</h2>
        <p className="ml-1 pt-4 text-sm text-white">[beta]</p>
      </Link>
    </div>
  )
}

export const TitleBar = TitleBarComponent
