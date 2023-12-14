"use client";
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {theme} from "@/app/resources/theaming";
import {ThemeProvider} from "@mui/system";
import {useApi} from "@/app/resources/services/useApi";
import {useState} from "react";
import {Alert} from "@mui/material";
import {setToken} from "@/app/resources/services/authService";
import NotAuthCheck from "@/app/resources/components/Auth/NoAuthCheck";
import {useRouter} from "next/navigation";

export default function Login() {
    const api = useApi();
    const [showError, setShowError] = useState(false);
    const router = useRouter();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowError(false);

        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

        if (!email || !password) {
            setShowError(true);
            return;
        }

        api('login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
        }).then((res) => {
            setToken(res.token);
            router.push('/profile');
        }).catch((err) => {
            setShowError(true);
            console.error(err);
        })
    };

    return (
        <NotAuthCheck>
            {showError && <Alert severity="error">Mail et/ou mot de passe invalides</Alert>}
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Connexion
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Adresse mail"
                            name="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Mot de passe"
                            type="password"
                            id="password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Connexion
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/register" variant="body2">
                                    Vous n'avez pas de compte ? Inscrivez-vous
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </NotAuthCheck>
    );
}