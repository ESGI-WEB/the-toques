import {createTheme} from "@mui/material/styles";
import {pink, purple, teal} from "@mui/material/colors";

export const theme = createTheme({
    palette: {
        primary: {
            main: teal[500],
        },
        secondary: {
            main: pink[500],
        },
        background: {
            default: '#f7f7f7',
        },
        text: {
            primary: '#333',
            secondary: '#666',
        },
        error: {
            main: purple[500],
        },
        success: {
            main: teal[500],
        },
    },
    typography: {
        fontFamily: ['Arial', 'sans-serif'].join(','),
        h1: {
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#333',
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: '#333',
        },
        h3: {
            fontSize: '1.2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: '#333',
        },
        body1: {
            fontSize: '1rem',
            color: '#333',
        },
        body2: {
            fontSize: '0.9rem',
            color: '#666',
        },
        button: {
            textTransform: 'none',
            fontWeight: 700,
        },
    },
    shape: {
        borderRadius: 8,
    },
});
