import { Footer } from "@/components/layouts/Footer"
import { Header } from "./Header"
import classNames from "classnames"
import { RefCallback } from "react"
import React from "react"

const LayoutComponent = ({
  children,
  docKey,
  home,
  lockHeaderFooter = false,
}: {
  children: JSX.Element
  docKey?: string
  home?: boolean
  lockHeaderFooter?: boolean
}) => {
  return (
    <div
      className={classNames(
        "flex min-h-screen w-full flex-col items-center justify-between",
        {
          "": home,
          "h-screen": lockHeaderFooter,
        }
      )}
    >
      <Header home={home} docKey={docKey} />
      <main
        className={classNames("grow", {
          "min-h-0 max-w-3xl md:w-2/3": !home,
        })}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}

export const Layout = LayoutComponent
