import { SignInOrSignUpView } from "@/views/auth/SignInOrSignUpView"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"
import type { NextPage } from "next"
import Head from "next/head"

const CreateAccountPage: NextPage = rootComponent(() => {
  return (
    <div>
      <Head>
        <title>Sign up</title>
        <meta name="description" content="Login to XQ Language" />
      </Head>
      <main>
        <SignInOrSignUpView signUpMode />
      </main>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler({
  userRequirement: "requiresNoLoggedInUser",
})()

export default CreateAccountPage
