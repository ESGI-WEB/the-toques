import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { alpha } from "@mui/material";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";

export default function SearchInput({
    onKeyPress,
    value,
}) {
    const [searchValue, setSearchValue] = useState<string>('');
    useEffect(() => {
        setSearchValue(value);
    }, [value]);

    const searchStyles = {
        position: 'relative',
        borderRadius: '4px', // You can adjust this value
        backgroundColor: alpha('#fff', 0.15),
        '&:hover': {
            backgroundColor: alpha('#fff', 0.25),
        },
        marginRight: '8px', // You can adjust this value
        marginLeft: '0',
        width: '100%',
        '@media (min-width: 600px)': {
            marginLeft: '12px', // You can adjust this value
            width: 'auto',
        },
    };

    const inputBaseStyles = {
        color: 'inherit',
        padding: '8px', // You can adjust this value
        paddingLeft: 'calc(1em + 32px)', // You can adjust this value
        transition: 'width 0.3s ease-in-out',
        width: '100%',
        '@media (min-width: 600px)': {
            width: '200px', // You can adjust this value
        },
    };

    const searchIconWrapperStyles = {
        padding: '8px', // You can adjust this value
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onKeyPress(event);
        }
    };

    return (
        <Box sx={searchStyles}>
            <Box sx={searchIconWrapperStyles}>
                <SearchIcon />
            </Box>
            <InputBase
                placeholder="Rechercher…"
                inputProps={{ 'aria-label': 'search' }}
                onKeyDown={handleKeyPress}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                style={inputBaseStyles}
            />
        </Box>
    );
}
