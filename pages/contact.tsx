import { Layout } from "@/components/layouts/Layout"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"

const Contact = rootComponent(() => {
  return (
    <Layout>
      <div className="m-2">
        <h1 className="mt-8 mb-4 text-3xl font-bold">Contact Us</h1>
        <p className="my-4">
          Yomuya was built with love, caffeine and books, lots of books, by{" "}
          <a
            className="underline hover:decoration-2"
            href="http://freedavid.co/"
            target="_blank"
            rel="noopener noreferrer"
          >
            David Gaynor
          </a>{" "}
          and{" "}
          <a
            className="underline hover:decoration-2"
            href="https://pscoleman.me/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Patrick Coleman
          </a>
          .
        </p>
        <p className="my-4">
          Questions? Comments? Fan mail? Hate mail? Get in touch with us at{" "}
          <a
            className="underline hover:decoration-2"
            href="mailto:hello@yomuya.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            hello@yomuya.com
          </a>
          .
        </p>
        <h2 className="mt-8 mb-4 text-2xl font-bold">Need support?</h2>
        <p className="my-4">
          Contact us at{" "}
          <a
            className="underline hover:decoration-2"
            href="mailto:help@yomuya.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            help@yomuya.com
          </a>
          .
        </p>
      </div>
    </Layout>
  )
})

export const getServerSideProps = buildPrefetchHandler()()

export default Contact
