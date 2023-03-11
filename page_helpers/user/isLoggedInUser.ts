import {
  BasicUser,
  getUserRequirementChecker,
} from "@/views/view_builder/buildPrefetchHandler"

export const isLoggedInUser = (user: BasicUser) =>
  getUserRequirementChecker("requiresLoggedInUser")(user).allowed
