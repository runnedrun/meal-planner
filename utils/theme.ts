import { createTheme, responsiveFontSizes } from "@mui/material"
import colors from "tailwindcss/colors"
import { globalStyleOverrides } from "../utils/globalStyleOverrides"

// Create a theme instance.
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: globalStyleOverrides,
    },
    MuiTextField: {
      defaultProps: {
        inputProps: {
          // className: "p-4",
        },
      },
    },
    MuiInputBase: {
      defaultProps: {
        inputProps: {
          // className: "p-4",
        },
      },
    },
  },
  palette: {
    primary: {
      main: colors.blue[500],
      contrastText: colors.white,
    },
    secondary: {
      main: colors.orange[500],
      contrastText: colors.white,
    },
    info: {
      main: colors.white,
    },
    error: {
      main: colors.red[600],
      contrastText: colors.white,
    },
    // @ts-ignore
    tertiary: {
      main: colors.green[500],
      contrastText: colors.white,
    },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
  },
})

export default responsiveFontSizes(theme)
