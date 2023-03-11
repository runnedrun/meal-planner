import { LoginBar } from "@/components/controls/LoginBar"
import {
  AppBar,
  Button,
  Container,
  Toolbar,
  useMediaQuery,
} from "@mui/material"
import Link from "next/link"
import { NavMenu } from "./NavMenu"
import { TitleBar } from "./TitleBar"

const HomeHeaderComponent = () => {
  const aboveMediumScreenSize = useMediaQuery("(min-width: 768px)")

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters className="flex items-center justify-between">
          <NavMenu home={true} className="flex md:hidden" />
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
                <Link href="/about" passHref>
                  <Button
                    className="mr-1 max-w-fit rounded-full normal-case"
                    color="info"
                  >
                    About
                  </Button>
                </Link>
              </div>
            )}
            <LoginBar />
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export const HomeHeader = HomeHeaderComponent
