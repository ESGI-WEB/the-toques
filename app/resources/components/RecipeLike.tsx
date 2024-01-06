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
import {FavoriteBorderRounded, FavoriteRounded} from "@mui/icons-material";
import {theme} from "@/app/resources/theaming";

export default function RecipeLike(
    {
        recipe,
        onChange = (recipe: Recipe) => {}
    }: {
        recipe: Recipe,
        onChange?: any
    }
) {
    const api = useApi();
    const [isLiked, setIsLiked] = useState<boolean>(recipe.isLiked ?? false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const toggleLike = (event: any) => {
        event.stopPropagation();
        event.preventDefault();

        setIsSubmitting(true);
        api('recipes/' + recipe.id + '/like', {
            method: isLiked ? 'DELETE' : 'POST'
        }).then(() => {
            setIsLiked(!isLiked);
            recipe.isLiked = !isLiked;
            onChange && onChange(recipe);
        }).finally(() => {
            setIsSubmitting(false);
        });
    }

    return (
        <IconButton onClick={(event) => toggleLike(event)} disabled={isSubmitting}>
            {!isSubmitting && (isLiked ?
                    <FavoriteRounded sx={{color: theme.palette.secondary.main}}></FavoriteRounded> :
                    <FavoriteBorderRounded></FavoriteBorderRounded>
            )}
            {isSubmitting && <FavoriteRounded sx={{opacity: 0.5}}></FavoriteRounded>}
        </IconButton>
    );
}