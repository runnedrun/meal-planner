import { initializeApp } from "firebase-admin/app"
import { getAuth, UserRecord } from "firebase-admin/auth"
import * as dotenv from "dotenv"

dotenv.config()

initializeApp()

const email = process.argv[2]
if (!email) {
  console.log("Email is required as argument")
  process.exit(1)
}

const VALID_EMAIL =
  /^[_a-z0-9-]+(\.[_a-z0-9-]+)*(\+[a-z0-9-]+)?@[a-z0-9-]+(\.[a-z0-9-]+)*$/g
if (!VALID_EMAIL.test(email)) {
  console.log("Invalid email")
  process.exit(1)
}

const run = async () => {
  const auth = getAuth()
  let user: UserRecord
  try {
    user = await auth.getUserByEmail(email)
  } catch (e) {
    console.log("User not found")
    process.exit(1)
  }
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: false,
  })
  console.log("User ", user.uid, "with email ", email, " is now an admin")
  console.log("All claims: ", user.customClaims)
}

run()
