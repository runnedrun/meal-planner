import { Timestamp } from "firebase/firestore"

export const genExtraData = () => {
  return {
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    archived: false,
  }
}
