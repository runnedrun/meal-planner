import { Layout } from "@/components/layouts/Layout"
import { TermsAndConditions } from "@/components/policies/TermsAndConditions"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"

const Terms = rootComponent(() => {
  return (
    <Layout>
      <TermsAndConditions />
    </Layout>
  )
})

export const getServerSideProps = buildPrefetchHandler()()

export default Terms
