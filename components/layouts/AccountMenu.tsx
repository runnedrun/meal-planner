import { ManageAccountJourney } from "@/analytics/journeys/ManageAccountJourney"
import { SignOutJourney } from "@/analytics/journeys/SignOutJourney"
import { useComponentContext } from "@/data/hooks/useComponentContext"
import { isLoggedInUser } from "@/page_helpers/user/isLoggedInUser"
import {
  Close,
  Help,
  LibraryBooks,
  Login,
  Logout,
  Person,
  PersonAdd,
  PersonAddAlt,
  Settings,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Drawer,
  Icon,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material"
import { getAuth, signOut } from "firebase/auth"
import Link from "next/link"
import { useState } from "react"

const MENU_WIDTH = 250

const AccountMenuComponent = (props) => {
  const { user } = useComponentContext()
  const isLoggedIn = isLoggedInUser(user)
  const [open, setOpen] = useState(false)
  const aboveMediumScreenSize = useMediaQuery("(min-width: 768px)")

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
    <div {...props}>
      <Button
        onClick={toggleMenu(true)}
        variant="outlined"
        color="info"
        className="hidden rounded-full normal-case md:flex"
        {...ManageAccountJourney.elDecorators.clickAccountButton()}
      >
        Account
      </Button>
      <IconButton
        onClick={toggleMenu(true)}
        color="info"
        className="flex md:hidden"
        {...ManageAccountJourney.elDecorators.clickAccountButton()}
      >
        {isLoggedIn ? <Person /> : <PersonAddAlt />}
      </IconButton>
      <Drawer anchor="right" open={open} onClose={toggleMenu(false)}>
        <Box
          sx={{ width: MENU_WIDTH }}
          role="presentation"
          onKeyDown={toggleMenu(false)}
        >
          <ListItem>
            <IconButton onClick={toggleMenu(false)}>
              <Close />
            </IconButton>
            <h2 className="mx-2 w-full text-right text-lg font-bold">
              Account
            </h2>
          </ListItem>
          <hr />
          {isLoggedIn ? null : (
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
          {/* <ListItemButton disabled={isLoggedIn ? false : true}>
            <Link href="/profile" passHref className="flex items-center">
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </Link>
          </ListItemButton> */}
          <ListItemButton disabled={isLoggedIn ? false : true}>
            <Link href="/settings" passHref className="flex items-center">
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </Link>
          </ListItemButton>
          {/* <ListItemButton disabled={isLoggedIn ? false : true}>
            <Link href="/billing" passHref className="flex items-center">
              <ListItemIcon>
                <Payment />
              </ListItemIcon>
              <ListItemText primary="Billing" />
            </Link>
          </ListItemButton> */}
          <ListItemButton>
            <Link href="/contact" passHref className="flex items-center">
              <ListItemIcon>
                <Help />
              </ListItemIcon>
              <ListItemText primary="Support" />
            </Link>
          </ListItemButton>
          {isLoggedIn ? (
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

export const AccountMenu = AccountMenuComponent
