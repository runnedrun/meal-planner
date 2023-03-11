import { SignOutJourney } from "@/analytics/journeys/SignOutJourney"
import { useComponentContext } from "@/data/hooks/useComponentContext"
import { isLoggedInUser } from "@/page_helpers/user/isLoggedInUser"
import { getAuth, signOut } from "@firebase/auth"
import { LibraryBooks, PersonAdd } from "@mui/icons-material"
import { Button, IconButton, useMediaQuery } from "@mui/material"
import Link from "next/link"

const LoginBarComponent = () => {
  const { user } = useComponentContext()
  const isLoggedIn = isLoggedInUser(user)
  const aboveMediumScreenSize = useMediaQuery("(min-width: 768px)")

  return (
    <div>
      {aboveMediumScreenSize ? (
        <>
          {isLoggedIn ? (
            <>
              <Button
                className="mr-1 rounded-full normal-case"
                color="info"
                onClick={() => {
                  signOut(getAuth())
                }}
                {...SignOutJourney.elDecorators.clickSignOutButton()}
              >
                Sign Out
              </Button>
              <Link href="/my_docs" passHref>
                <Button
                  variant="outlined"
                  color="info"
                  className="rounded-full normal-case"
                >
                  My Docs
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign_in" passHref>
                <Button className="mr-1 rounded-full normal-case" color="info">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign_up" passHref>
                <Button
                  variant="outlined"
                  color="info"
                  className="rounded-full normal-case"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </>
      ) : (
        <>
          {isLoggedIn ? (
            <Link href="/my_docs" passHref>
              <IconButton color="info">
                <LibraryBooks />
              </IconButton>
            </Link>
          ) : (
            <Link href="/sign_up" passHref>
              <IconButton color="info">
                <PersonAdd />
              </IconButton>
            </Link>
          )}
        </>
      )}
    </div>
  )
}

export const LoginBar = LoginBarComponent
