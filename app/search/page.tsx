"use client";
import * as React from 'react';
import {useEffect, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import Typography from "@mui/material/Typography";
import {CircularProgress} from "@mui/material";
import RecipeCard from "@/app/resources/components/RecipeCard";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import {Recipe} from "@/app/resources/models/recipe.model";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {getToken} from "@/app/resources/services/authService";

export default function Search() {
    const searchParams = useSearchParams();
    const charactersForSearch = searchParams.get("characters")?.replace(/"/g, '');
    const token = getToken() || null;
    const [recipes, setRecipes] = useState<Recipe[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const abortController = useRef(new AbortController());

    // vercel issue, ia too long to response, it would be great to display
    // a loading indicator or show recipe as they are chosen by ia but not enough time
    useEffect(() => {
        setRecipes(null)
        setError(false);
        setLoading(true);

        const onMessage = (event: any) => {
            const data = JSON.parse(event.data);
            if (data.message === 'received') {
                return;
            }
            setRecipes(data);
            setLoading(false);
            stopSearchSSERequest();
        }

        const onError = (error: any) => {
            console.error('Error with SSE:', error);
            stopSearchSSERequest();
            setError(true);
            setLoading(false);
        }

        fetchEventSource('/api/search?characters=' + charactersForSearch, {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
            },
            onmessage: onMessage,
            onerror: onError,
        });

        return () => {
            stopSearchSSERequest();
        };
    }, [charactersForSearch]);

    const stopSearchSSERequest = () => {
        abortController.current.abort();
        abortController.current = new AbortController();
    }

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