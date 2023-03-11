import Link from "next/link"

const FooterComponent = () => {
  return (
    <footer className="flex w-full flex-col items-center bg-background py-2 text-sm text-white drop-shadow-xl">
      <p>Copyright © 2023 — Yomuya</p>
      <p>
        <Link href="/privacy" className="mx-2">
          Privacy
        </Link>{" "}
        |{" "}
        <Link href="/terms" className="mx-2">
          Terms
        </Link>{" "}
        |{" "}
        <Link href="/about" className="mx-2">
          About
        </Link>
        |{" "}
        <Link href="/contact" className="mx-2">
          Contact
        </Link>
      </p>
    </footer>
  )
}

export const Footer = FooterComponent
