import { Layout } from "@/components/layouts/Layout"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"
import Link from "next/link"

const Billing = rootComponent(({ _context: { user } }) => {
  return (
    <Layout>
      <div>
        <h1 className="mt-6 mb-4 text-3xl font-bold">Future billing page</h1>
        <p className="my-4">
          Hello time traveler. You should not be here, as this page does not
          exist yet.{" "}
          <Link href="/" className="underline hover:decoration-2">
            Return from whence you came.
          </Link>
        </p>
      </div>
    </Layout>
  )
})

export const getServerSideProps = buildPrefetchHandler()()

export default Billing
