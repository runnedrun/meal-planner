import { isServerside } from "@/helpers/isServerside"
import { getAnalytics, setUserId } from "firebase/analytics"
import { isUndefined } from "mathjs"
import { BehaviorSubject, filter, firstValueFrom } from "rxjs"

export const loggerUserIdSubject = new BehaviorSubject<string>(undefined)

export const WINDOW_KEY_USER_ID_PROMISE = "_definedUserIdPromise"

export const setLoggerUserId = (userId) => {
  loggerUserIdSubject.next(userId)
  setUserId(getAnalytics(), userId)
}

export const getLoggerUserId = () => {
  return loggerUserIdSubject.getValue()
}

export const getDefinedUserIdPromise = () =>
  firstValueFrom(loggerUserIdSubject.pipe(filter((_) => !isUndefined(_))))

if (!isServerside()) {
  ;(window as any)[WINDOW_KEY_USER_ID_PROMISE] = getDefinedUserIdPromise
}
