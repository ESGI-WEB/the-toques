"use client";
import * as React from 'react';
import AuthCheck from "@/app/resources/components/Auth/AuthCheck";
import {useApi} from "@/app/resources/services/useApi";
import {decodeToken, JWTToken} from "@/app/resources/services/authService";
import {CircularProgress} from "@mui/material";
import RecipeCard from "@/app/resources/components/RecipeCard";
import Typography from "@mui/material/Typography";
import {Recipe} from "@/app/resources/models/recipe.model";
import Button from "@mui/material/Button";

export default function FavoritesPage() {
    const api = useApi();
    const [recipes, setRecipes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const tokenData = decodeToken();
        if (!tokenData) {
            return;
        }

        api(`users/${tokenData.id}/recipes`, {
            method: 'GET',
        }).then(recipes => {
            setRecipes(recipes);
            setLoading(false);
        });
    }, []);

    return (
        <AuthCheck>
            <Typography variant="h1" gutterBottom>Vos recettes</Typography>
            {loading && <CircularProgress/>}
            <div className="flex p-24 gap-30 flex-wrap">
                {!loading && recipes?.length > 0 && recipes.map((recipe: any, index: number) => (
                    <RecipeCard recipe={recipe} key={recipe.id}/>
                ))}
            </div>
            {!loading && !recipes?.length &&
                <div>
                    <Typography variant="body1">Vous n&apos;avez pas encore créé de recettes</Typography>
                    <Button variant="contained" href="/recipes/create">Créer une recette</Button>
                </div>
            }
        </AuthCheck>
    );
}