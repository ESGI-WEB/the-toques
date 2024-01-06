'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {USER_ROLES} from "@/app/resources/models/user.model";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {decodeToken, JWTToken, removeToken} from "@/app/resources/services/authService";
import {useEffect, useState} from "react";
import {FavoriteRounded} from "@mui/icons-material";
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import {useRouter} from "next/navigation";
import SearchInput from "@/app/resources/components/SearchInput";
import AudioSearch from "@/app/resources/components/AudioSearch";

export default function Header() {
    const [menuOpened, setMenuOpened] = useState(false);
    const [tokenData, setTokenData] = useState<JWTToken|false>(false);
    const router = useRouter();
    const [transcript, setTranscript] = useState<string>('');

    const allMenuItems: MenuItem[] = [
        {text: 'Accueil', link: '/', icon: <HomeIcon/>},
        {text: 'Connexion', link: '/login', role: 'not-logged', icon: <PersonIcon/>},
        {text: 'Profil', link: '/profile', role: USER_ROLES.USER, icon: <PersonIcon/>},
        {text: 'Favoris', link: '/profile/favorites', role: USER_ROLES.USER, icon: <FavoriteRounded/>},
        {text: 'Vos recettes', link: '/profile/recipes', role: USER_ROLES.USER, icon: <LocalDiningIcon/>},
        {text: 'Ajouter une recette', link: '/recipes/create', role: USER_ROLES.USER, icon: <AddCircleOutlineIcon/>},

    ];

    const menuItems = allMenuItems.filter(item => {
        if (!item.role) {
            return true;
        }

        if (item.role === 'not-logged') {
            return !tokenData;
        }

        if (item.role && tokenData) {
            return tokenData.role === item.role;
        }
        return false;
    });

    const handleMenuClick = async (item: MenuItem) => {
        await router.push(item.link);
        setMenuOpened(false);
    }

    const handleSearchKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            router.push('/search?characters=' + JSON.stringify((event.target as HTMLInputElement).value));
        }
    };

    useEffect(() => {
        setTokenData(decodeToken());
    }, []);

    useEffect(() => {
        setTokenData(decodeToken());
    }, [(decodeToken() as JWTToken)?.id]);

    return (
            <Box sx={{flexGrow: 1}}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{mr: 2}}
                            onClick={() => setMenuOpened(true)}
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            CuisineConnect
                        </Typography>
                        <AudioSearch onTranscriptChange={setTranscript}/>
                        <SearchInput onKeyPress={handleSearchKeyPress} value={transcript}/>
                        {tokenData ?
                            <Button color="inherit" onClick={() => removeToken()}>Déconnexion</Button> :
                            <Button color="inherit" href="/login">Connexion</Button>
                        }
                    </Toolbar>
                    <Drawer
                        open={menuOpened}
                        onClose={() => setMenuOpened(false)}
                    >
                        <List>
                            {menuItems.map(item => (
                                <ListItem key={item.link} disablePadding>
                                    <ListItemButton onClick={() => handleMenuClick(item)}>
                                        <ListItemIcon>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.text}/>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Drawer>
                </AppBar>
            </Box>
    );
}

export interface MenuItem {
    text: string;
    link: string;
    icon?: React.ReactNode;
    role?: string | 'not-logged';
    onClick?: () => void;
}