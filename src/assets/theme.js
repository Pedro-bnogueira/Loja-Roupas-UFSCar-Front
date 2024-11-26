import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#01AC67",
            light: "#ACE67C",
            dark: "#16584A",
            contrastText: "#FAFAFA",
        },
        secondary: {
            main: "#FE804B",
            contrastText: "#FAFAFA",
        },
        tertiary: {
            main: "#FFF57E",
            constrastText: "#1C1C1C",
        },
    },
    typography: {
      fontFamily: 'Open Sans, Arial, sans-serif',
      h1: {
        fontFamily: 'Montserrat, sans-serif',
      },
      h2: {
        fontFamily: 'Montserrat, sans-serif',
      },
      h3: {
        fontFamily: 'Montserrat, sans-serif',
      },
      button: {
        fontFamily: 'Poppins, sans-serif',
      },
    },
});

export default theme;
