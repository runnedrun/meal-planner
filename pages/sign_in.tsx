import type { NextPage } from "next"
import Head from "next/head"

import { SignInOrSignUpView } from "@/views/auth/SignInOrSignUpView"
import { buildPrefetchHandler } from "@/views/view_builder/buildPrefetchHandler"
import { rootComponent } from "@/views/view_builder/component"

const LoginPage: NextPage = rootComponent(() => {
  return (
    <div>
      <Head>
        <title>Sign in</title>
        <meta name="description" content="Login to XQ Language" />
      </Head>
      <main>
        <SignInOrSignUpView signUpMode={false} />
      </main>
    </div>
  )
})

export const getServerSideProps = buildPrefetchHandler({
  userRequirement: "requiresNoLoggedInUser",
})()

export default LoginPage
