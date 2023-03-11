import SplitScreenSignInOrUp from "@/components/layouts/SplitScreenSignInOrUp"
import { FirebaseAuthErrors } from "@/data/auth/FirebaseAuthErrors"
import { setters } from "@/data/fb"
import { getAuth } from "@/data/getAuth"
import readingDuck from "@/public/images/reading_duck.png"
import { FirebaseError } from "@firebase/util"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import Image from "next/image"
import { useRouter } from "next/router"
import { useState } from "react"

interface SignInOrSignUpProps {
  signUpMode: boolean
}

const YomuyaIntroView = () => (
  <div className="py-15 flex h-full w-full flex-col items-center bg-gradient-to-r from-primary-400 via-primary-400 to-primary-200 px-32">
    <div className="mt-5 overflow-hidden rounded-3xl">
      <Image
        className="h-80 w-80 object-cover"
        src={readingDuck}
        alt="A duck reading a book"
      />
    </div>
    <div className="text-l mt-20 rounded-lg bg-primary-100 px-10 py-10 text-gray-700 shadow-lg">
      Welcome to Yomuya — learn another language by reading!
    </div>
  </div>
)

export const SignInOrSignUpView = ({ signUpMode }: SignInOrSignUpProps) => {
  const router = useRouter()
  const query =
    typeof window === "undefined"
      ? `?${new URLSearchParams(
          router.query as Record<string, any>
        ).toString()}`
      : window.location.search
  const [signInError, setSignInError] = useState("")

  return (
    <SplitScreenSignInOrUp
      error={signInError}
      mobileWelcomeMessage={{
        title: "Welcome To Yomuya!",
        subtitle: "Learn another language by reading.",
      }}
      alternativeCTA={
        signUpMode
          ? {
              text: "sign in to an existing account",
              href: `/sign_in${query}`,
            }
          : { text: "create an account", href: `/sign_up${query}` }
      }
      signInFn={(email, password) => {
        const auth = getAuth()
        const signInPromise = signUpMode
          ? createUserWithEmailAndPassword(auth, email, password).then(
              (user) => {
                setters.privateUser(user.user.uid, { email: email })
              }
            )
          : signInWithEmailAndPassword(auth, email, password)
        signInPromise.catch((e: FirebaseError) => {
          console.log("ERROR", e)
          const code = e.code
          setSignInError(FirebaseAuthErrors[code])
        })
      }}
      signInErrorFn={setSignInError}
      // forgotPasswordHref="#"
      splitScreenComponent={<YomuyaIntroView />}
      signUpMode={signUpMode}
    />
  )
}
