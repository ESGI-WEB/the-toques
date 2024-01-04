"use client";
import * as React from 'react';
import {useApi} from "@/app/resources/services/useApi";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {Recipe} from "@prisma/client";
import Typography from "@mui/material/Typography";
import {CircularProgress} from "@mui/material";
import RecipeCard from "@/app/resources/components/RecipeCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

export default function Search() {
    const searchParams = useSearchParams();
    const charactersForSearch = searchParams.get("characters")?.replace(/"/g, '');
    const api = useApi();
    const [recipes, setRecipes] = useState<Recipe[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const setUpRecipes = (recipes: Recipe[]) => {
        setRecipes(recipes);
    }

    useEffect(() => {
        setError(false);
        setLoading(true);
        api(`search`, {
            method: 'POST',
            body: JSON.stringify({
                "characters" : charactersForSearch
            }),
        }).then((res) => {
            setUpRecipes(res);
        }).catch((err) => {
            console.error(err);
            setError(err.error?.[0]?.message ?? "Une erreur est survenue lors de la recherche.");
        }).finally(() => {
            setLoading(false);
        });
    }, [charactersForSearch]);

    return (
        <>
            <Typography variant="h1" gutterBottom>
                Résultats de la recherche pour &quot;{charactersForSearch}&quot;
            </Typography>
            {loading && <CircularProgress />}
            {recipes !== null ? (
                <div className="flex p-24 gap-30 flex-wrap">
                    {recipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                    {recipes.length === 0 && (
                        <Typography>Aucun résultat<SentimentDissatisfiedIcon /></Typography>
                    )}
                </div>
            ) : null}
            {error !== null && (
                <Typography color="error">{error}</Typography>
            )}
        </>
    );
}