import { isDemoMode } from "@/helpers/isDemoMode"
import { isServerside } from "@/helpers/isServerside"
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions"
import { init } from "../initFb"

const buildCallableFunction = <ArgType, OutputType>(
  backendFunctionName: string,
  functionToCallOnServer = (args: ArgType) =>
    Promise.resolve(null) as Promise<OutputType>
) => {
  init()
  const functions = getFunctions()
  isDemoMode() && connectFunctionsEmulator(functions, "localhost", 5011)
  const func = isServerside()
    ? functionToCallOnServer
    : (args: ArgType) =>
        httpsCallable(
          functions,
          backendFunctionName
        )(args).then((_) => _.data as OutputType)

  return (args: ArgType) => {
    return func(args)
  }
}

// export const addPronunciationToChunksCallable = buildCallableFunction<
//   AddPronunciationToChunksInput<DisplayChunk>,
//   AddPronunciationToChunksOutput<DisplayChunk>
// >("addPronunciationToChunksCallable", ({ chunks }) => Promise.resolve(chunks))

// export const processTestsCallable = buildCallableFunction<
//   ProcessTestsCallableInput,
//   void
// >("processTestsCallable", () => Promise.resolve(null))
