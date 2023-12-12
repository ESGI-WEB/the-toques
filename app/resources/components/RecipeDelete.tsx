"use client";
import React, {useState} from 'react';
import {Paper, Rating} from '@mui/material';
import {useForm} from "react-hook-form";
import TextField from "@mui/material/TextField";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import {useApi} from "@/app/resources/services/useApi";
import {Mark, Recipe} from "@/app/resources/models/recipe.model";
import IconButton from "@mui/material/IconButton";
import {Delete, FavoriteBorderRounded, FavoriteRounded} from "@mui/icons-material";
import {theme} from "@/app/resources/theaming";
import {useRouter} from "next/navigation";
import {decodeToken} from "@/app/resources/services/authService";

export default function RecipeDelete(
    {
        recipe,
    }: {
        recipe: Recipe,
    }
) {
    const api = useApi();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();
    const tokenData = decodeToken();

    const deleteRecipe = () => {

        setIsSubmitting(true);
        api('recipes/' + recipe.id, {
            method: 'DELETE'
        }).then(() => {
            router.push('/profile/recipes');
        }).finally(() => {
            setIsSubmitting(false);
        });
    }

    if (tokenData && recipe.authorId !== tokenData.id) {
        return null;
    }

    return (
        <IconButton onClick={deleteRecipe} disabled={isSubmitting}>
            <Delete sx={{opacity: isSubmitting ? 0.5 : 1}} />
        </IconButton>
    );
}