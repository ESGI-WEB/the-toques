import Box from "@mui/material/Box";
import {theme} from "@/app/resources/theaming";

export default function BotMessage({variant, children, baseStyle, stylesByVariant}: any) {

    baseStyle = baseStyle ?? {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        border: 'solid 1px',
        borderColor: theme.palette.primary.main,
        width: 'fit-content',
    }

    stylesByVariant = stylesByVariant ?? {
        primary: {
            borderBottomRightRadius: '0',
            marginLeft: 'auto',
        },
        secondary: {
            borderBottomLeftRadius: '0',
            marginRight: 'auto',
        },
        error: {
            borderColor: theme.palette.error.main
        }
    }


    return (
        <Box sx={{...baseStyle, ...stylesByVariant[variant]}}>
            {children}
        </Box>
    )
}