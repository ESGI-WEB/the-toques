"use client";
import * as React from 'react';
import {theme} from "@/app/resources/theaming";
import AuthCheck from "@/app/resources/components/Auth/AuthCheck";
import {decodeToken, removeToken} from "@/app/resources/services/authService";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {useEffect} from "react";
import {useApi} from "@/app/resources/services/useApi";
import {User} from "@/app/resources/models/user.model";
import LoadingButton from "@mui/lab/LoadingButton";
import {Card, CardActions, CardContent, CircularProgress} from "@mui/material";
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import {useRouter} from "next/navigation";
import {FavoriteRounded} from "@mui/icons-material";

export default function Profile() {
    const userData = decodeToken();
    const [saving, setSaving] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const api = useApi();
    const [preferences, setPreferences] = React.useState('');
    const [profile, setProfile] = React.useState<User | null>(null);
    const router = useRouter();

    const savePreferences = () => {
        if (!profile) return;
        if (preferences === profile.preferences) return;

        setSaving(true);
        api(`users/${profile.id}`, {
            method: 'PUT',
            body: JSON.stringify({preferences: preferences}),
        }).then(() => {
            profile.preferences = preferences;
        }).finally(() => {
            setSaving(false);
        });
    }

    const loadProfile = () => {
        if (!userData) return;

        api(`users/${userData.id}`, {
            method: 'GET',
        }).then((res) => {
            setProfile(res);
            setPreferences(res.preferences);
        });
    }

    const deleteProfile = () => {
        if (!userData) return;

        setDeleting(true);
        api(`users/${userData.id}`, {
            method: 'DELETE',
        }).then(() => {
            removeToken();
        }).finally(() => {
            setDeleting(false);
        });
    }

    useEffect(() => {
        loadProfile();
    }, []);

    if (!userData || !profile) return (
        <AuthCheck>
            <CircularProgress/>
        </AuthCheck>
    );

    return (
        <AuthCheck>
            <div className="flex flex-column gap-40 col-6 flex-items-center margin-auto">
                <div className="flex gap-20 flex-items-center">
                    <Avatar sx={{
                        bgcolor: theme.palette.secondary.main,
                    }}>
                        {userData.firstName.charAt(0)}
                    </Avatar>
                    <span>{userData.firstName}</span>
                </div>
                <TextField
                    value={userData.email}
                    label="Email"
                    disabled
                    fullWidth
                />
                <div className="full-width">
                    <TextField
                        value={preferences}
                        label="Vos préférences alimentaires"
                        fullWidth
                        multiline
                        rows={6}
                        disabled={saving}
                        onChange={(e) => setPreferences(e.target.value)}
                    />
                    {preferences !== profile.preferences && <LoadingButton
                        variant="contained"
                        color="primary"
                        loading={saving}
                        onClick={savePreferences}
                        className="margin-top-20"
                    >
                        Enregistrer
                    </LoadingButton>}
                </div>
                <div className="flex gap-20 flex-wrap">
                    <Card variant="outlined">
                        <CardContent>
                            <div className="flex gap-10 flex-items-center">
                                <RestaurantMenuIcon color="primary"/>
                                <Typography variant="h2" color="primary">
                                    {profile._count.recipes}
                                </Typography>
                            </div>
                            <Typography variant="body1">
                                Recettes créées
                            </Typography>
                        </CardContent>
                        <CardActions>
                            {profile._count.recipes > 0 &&
                                <Button size="small" color="secondary" onClick={() => router.push('/profile/recipes')}>Voir
                                    vos recettes</Button>
                            }
                            <Button size="small" color="secondary" onClick={() => router.push('/recipes/create')}>Créer
                                une recette</Button>
                        </CardActions>
                    </Card>
                    <Card variant="outlined">
                        <CardContent>
                            <div className="flex gap-10 flex-items-center">
                                <MarkChatReadIcon color="primary"/>
                                <Typography variant="h2" color="primary">
                                    {profile._count.marks}
                                </Typography>
                            </div>
                            <Typography variant="body1">
                                Avis donnés
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card variant="outlined">
                        <CardContent>
                            <div className="flex gap-10 flex-items-center">
                                <FavoriteRounded color="primary"/>
                                <Typography variant="h2" color="primary">
                                    {profile._count.likes}
                                </Typography>
                            </div>
                            <Typography variant="body1">
                                Recettes aimées
                            </Typography>
                        </CardContent>

                        {profile._count.recipes > 0 &&
                            <CardActions>
                                <Button size="small" color="secondary" onClick={() => router.push('/profile/favorites')}>Voir
                                    vos favoris
                                </Button>
                            </CardActions>
                        }
                    </Card>
                </div>
                <div className="flex gap-20 flex-wrap">
                    <Button variant="contained" color="secondary" onClick={() => removeToken()}>
                        Déconnexion
                    </Button>
                    <LoadingButton loading={deleting} variant="contained" color="error" onClick={() => deleteProfile()}>
                        Supprimer mon compte
                    </LoadingButton>
                </div>
            </div>
        </AuthCheck>
    );
}