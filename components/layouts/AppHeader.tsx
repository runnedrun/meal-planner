import { uuidv4 } from "@firebase/util"
import { SimpleCreateDocJourney } from "@/analytics/journeys/SimpleCreateDocJourney"
import { AccountMenu } from "@/components/layouts/AccountMenu"
import { useComponentContext } from "@/data/hooks/useComponentContext"
import { createNewDefaultDocWithVersions } from "@/data/viewDataHelpers/createNewDefaultDocWithVersions"
import { isLoggedInUser } from "@/page_helpers/user/isLoggedInUser"
import {
  AppBar,
  Button,
  Container,
  Toolbar,
  useMediaQuery,
} from "@mui/material"
import Link from "next/link"
import { LoginBar } from "../controls/LoginBar"
import { NavMenu } from "./NavMenu"
import { TitleBar } from "./TitleBar"

const AppHeaderComponent = () => {
  const { user } = useComponentContext()
  const isLoggedIn = isLoggedInUser(user)
  const createNewDoc = async () => {
    const uid = uuidv4()
    window.location.href = `/edit_doc/${uid}`
  }
  const aboveMediumScreenSize = useMediaQuery("(min-width: 768px)")

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters className="flex items-center justify-between">
          <NavMenu home={false} className="flex md:hidden" />
          <TitleBar home={true} />
          <div className="flex items-center">
            {aboveMediumScreenSize && (
              <div className="flex items-center">
                <Link href="/library" passHref>
                  <Button
                    className="mr-1 rounded-full normal-case"
                    color="info"
                  >
                    Library
                  </Button>
                </Link>
                {isLoggedIn && (
                  <>
                    <Link href="/my_docs" passHref>
                      <Button
                        className="mr-1 rounded-full normal-case"
                        color="info"
                      >
                        My Docs
                      </Button>
                    </Link>
                    <Button
                      className="mr-1 rounded-full normal-case"
                      color="info"
                      onClick={createNewDoc}
                      {...SimpleCreateDocJourney.elDecorators.clickNewDocButton()}
                    >
                      New Doc
                    </Button>
                  </>
                )}
              </div>
            )}
            <AccountMenu />
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export const AppHeader = AppHeaderComponent
