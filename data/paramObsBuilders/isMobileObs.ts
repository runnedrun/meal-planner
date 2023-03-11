import { isServerside } from "@/helpers/isServerside"
import { ServerValueNames } from "@/views/view_builder/buildPrefetchHandler"
import { defer, filter, map, of } from "rxjs"
import { buildParamaterizedObs } from "../builders/buildParamterizedObs"
import { isMobile } from "react-device-detect"
import { contextValue } from "./contextValue"

export const isMobileObs = () =>
  contextValue("serverValues").pipe(map((_) => _.isMobile))
