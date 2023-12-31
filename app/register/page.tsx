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
import {ThemeProvider} from '@mui/material/styles';
import {theme} from "@/app/resources/theaming";
import {useApi} from "@/app/resources/services/useApi";
import {useState} from "react";
import {Alert} from "@mui/material";
import {setToken} from "@/app/resources/services/authService";
import NotAuthCheck from "@/app/resources/components/Auth/NoAuthCheck";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import LoadingButton from "@mui/lab/LoadingButton";

export default function Register() {
    const api = useApi();
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        const data = new FormData(event.currentTarget);
        const firstName = data.get('firstName');
        const email = data.get('email');
        const password = data.get('password');

        if (!firstName || !email || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        api('users', {
            method: 'POST',
            body: JSON.stringify({
                firstName,
                email,
                password,
            }),
        }).then((res) => {
            setToken(res.token);
            router.push('/login');
        }).catch((err) => {
            setError(err.error[0].message || 'formulaire invalide');
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <NotAuthCheck>
            {error?.length > 0 && <Alert severity="error">{error}</Alert>}
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
                        Inscription
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{mt: 3}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="Prénom"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Adresse mail"
                                    name="email"
                                    autoComplete="email"
                                    type="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Mot de passe"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                            loading={loading}
                        >
                            Inscription
                        </LoadingButton>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Vous avez déjà un compte ? Connectez-vous
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </NotAuthCheck>
    );
}