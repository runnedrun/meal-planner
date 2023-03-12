import * as functions from "firebase-functions"
import { genPlan } from "./genPlan"

// http://127.0.0.1:5010/demo-mealplanner/us-central1/triggerPlanGen
export const triggerPlanGen = functions.https.onRequest((request, response) => {
  genPlan()
  response.send("done")
})
