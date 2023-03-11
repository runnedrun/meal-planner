export type TestLogEntry = {
  name: string
  createdAt: number
  data: Record<string, any>
  userId: string
}
export const getTestLogKey = (id: string) => `testLog-${id}`
export const addTestLog = (
  testId: string,
  name: string,
  data: Record<string, any>,
  userId: string
) => {
  const testLogObj = getTestLogs(testId)
  testLogObj.push({
    name,
    createdAt: Date.now(),
    data,
    userId,
  } as TestLogEntry)

  localStorage.setItem(getTestLogKey(testId), JSON.stringify(testLogObj))
  console.log(`TestLogger: ${name}`, data, "userId: ", userId)
}

export const getTestLogs = (
  testId: string,
  localStorage: Storage = window.localStorage
) => {
  const logKey = getTestLogKey(testId)
  const testLog = localStorage.getItem(logKey) || "[]"
  const testLogObj = JSON.parse(testLog) as TestLogEntry[]
  return testLogObj
}
