"use client";
import * as React from 'react';
import {useApi} from "@/app/resources/services/useApi";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import Typography from "@mui/material/Typography";
import {CircularProgress} from "@mui/material";
import RecipeCard from "@/app/resources/components/RecipeCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import {Recipe} from "@/app/resources/models/recipe.model";

export default function Search() {
    const searchParams = useSearchParams();
    const charactersForSearch = searchParams.get("characters")?.replace(/"/g, '');
    const api = useApi();
    const [recipes, setRecipes] = useState<Recipe[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [eventSource, setEventSource] = useState<EventSource|null>(null);

    useEffect(() => {
        setRecipes(null)
        setError(false);
        setLoading(true);

        const source = new EventSource('/api/search?characters=' + charactersForSearch);
        setEventSource(source);

        // vercel issue, ia too long to response, it would be great to display
        // a loading indicator or show recipe as they are chosen by ia but not enough time
        source.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message === 'received') {
                return;
            }
            setRecipes(data);
            setLoading(false);
            source.close();
        };

        source.onerror = (error) => {
            console.error('Error with SSE:', error);
            source.close();
            setError(true);
            setLoading(false);
        };

        return () => {
            if (source) {
                source.close();
                setEventSource(null);
            }
        };
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