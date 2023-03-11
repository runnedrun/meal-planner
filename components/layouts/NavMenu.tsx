import { SignOutJourney } from "@/analytics/journeys/SignOutJourney"
import { useComponentContext } from "@/data/hooks/useComponentContext"
import { createNewDefaultDocWithVersions } from "@/data/viewDataHelpers/createNewDefaultDocWithVersions"
import { isLoggedInUser } from "@/page_helpers/user/isLoggedInUser"
import {
  Add,
  Close,
  Help,
  Info,
  LibraryBooks,
  LocalLibrary,
  Login,
  Logout,
  Menu,
  PersonAdd,
} from "@mui/icons-material"
import {
  Box,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { getAuth, signOut } from "firebase/auth"
import Link from "next/link"
import { HTMLAttributes, useState } from "react"

const MENU_WIDTH = 250

const NavMenuComponent = ({
  home,
  ...rest
}: { home: boolean } & HTMLAttributes<HTMLDivElement>) => {
  const [open, setOpen] = useState(false)

  const { user } = useComponentContext()
  const isLoggedIn = isLoggedInUser(user)
  const createNewDoc = async () => {
    const doc = await createNewDefaultDocWithVersions({ userId: user.id })
    window.location.href = `/edit_doc/${doc.uid}`
  }

  const toggleMenu =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return
      }

      setOpen(open)
    }

  return (
    <div {...rest}>
      <IconButton onClick={toggleMenu(true)} color="info">
        <Menu />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={toggleMenu(false)}>
        <Box
          sx={{ width: MENU_WIDTH }}
          role="presentation"
          onKeyDown={toggleMenu(false)}
        >
          <ListItem>
            <h2 className="mx-2 w-full text-lg font-bold">Menu</h2>
            <IconButton onClick={toggleMenu(false)}>
              <Close />
            </IconButton>
          </ListItem>
          <hr />
          {isLoggedIn || !home ? null : (
            <>
              <ListItemButton>
                <Link href="/sign_up" passHref className="flex items-center">
                  <ListItemIcon>
                    <PersonAdd />
                  </ListItemIcon>
                  <ListItemText primary="Sign Up" />
                </Link>
              </ListItemButton>
              <ListItemButton>
                <Link href="/sign_in" passHref className="flex items-center">
                  <ListItemIcon>
                    <Login />
                  </ListItemIcon>
                  <ListItemText primary="Sign In" />
                </Link>
              </ListItemButton>
              <hr />
            </>
          )}
          <ListItemButton>
            <Link href="/library" passHref className="flex items-center">
              <ListItemIcon>
                <LocalLibrary />
              </ListItemIcon>
              <ListItemText primary="Library" />
            </Link>
          </ListItemButton>
          {isLoggedIn && (
            <>
              <ListItemButton>
                <Link href="/my_docs" passHref className="flex items-center">
                  <ListItemIcon>
                    <LibraryBooks />
                  </ListItemIcon>
                  <ListItemText primary="My Documents" />
                </Link>
              </ListItemButton>
              <ListItemButton onClick={createNewDoc}>
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText primary="New Document" />
              </ListItemButton>
            </>
          )}
          <ListItemButton>
            <Link href="/about" passHref className="flex items-center">
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText primary="About" />
            </Link>
          </ListItemButton>
          {home && (
            <ListItemButton>
              <Link href="/contact" passHref className="flex items-center">
                <ListItemIcon>
                  <Help />
                </ListItemIcon>
                <ListItemText primary="Support" />
              </Link>
            </ListItemButton>
          )}
          {isLoggedIn && home ? (
            <>
              <hr />
              <ListItemButton onClick={() => signOut(getAuth())}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Out"
                  {...SignOutJourney.elDecorators.clickSignOutButton()}
                />
              </ListItemButton>
            </>
          ) : null}
        </Box>
      </Drawer>
    </div>
  )
}

export const NavMenu = NavMenuComponent
