import * as firebase from "firebase-admin/app"
import "./fixTsPaths"
import { triggerPlanGen } from "./triggerPlanGen"

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

firebase.initializeApp()

export { triggerPlanGen }
