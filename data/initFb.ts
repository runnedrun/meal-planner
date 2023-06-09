import { connectAuthEmulator, getAuth } from "@firebase/auth"
import { connectStorageEmulator, getStorage } from "@firebase/storage"
import { getApp as fbGetApp, initializeApp } from "firebase/app"
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore"

const getApp = (name?: string) => {
  let app = null
  try {
    app = fbGetApp(name)
  } catch (e) {}
  return app
}

export const init = () => {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE

  if (getApp()) return getFirestore()

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG_PROJECT_ID,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG_STORAGE_BUCKET,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG_APP_ID,
    measurementId:
      process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG_MEASUREMENT_ID,
  }

  const app = initializeApp(config)

  const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  })

  const storage = getStorage()
  demoMode && connectFirestoreEmulator(db, "localhost", 8070)
  demoMode && connectStorageEmulator(storage, "localhost", 9188)
  demoMode && connectAuthEmulator(getAuth(), "http://localhost:9088")
  return db
}
