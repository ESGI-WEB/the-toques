"use client";

import React from 'react';
import {Card, CardActionArea, CardContent, CardMedia, Rating, Typography} from '@mui/material';
import {Recipe} from "@/app/resources/models/recipe.model";
import {useRouter} from "next/navigation";
import RecipeLike from "@/app/resources/components/RecipeLike";

export default function RecipeCard(
    {
        recipe, onLikeChange = (recipe: Recipe) => {
    }
    }: {
        recipe: Recipe, onLikeChange?: any
    }
) {
    const router = useRouter();

    return (
        <Card
            onClick={() => router.push('/recipes/' + recipe.id)}
            sx={{
                width: 300,
                wordBreak: 'break-word',
            }}
        >
            <CardActionArea>
                <CardMedia
                    component="img"
                    alt={recipe.title}
                    height="140"
                    image={recipe.image}
                />
                <CardContent>
                    <Typography variant="h5" component="div">
                        {recipe.title}
                        {('isLiked' in recipe) && <RecipeLike recipe={recipe} onChange={onLikeChange}/>}
                    </Typography>
                    <div className="flex flex-row gap-10 flex-items-center">
                        <Typography variant="body2" color="text.secondary">
                            <Rating readOnly precision={0.5} value={recipe.marksAvg}/>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {recipe.marksCount} avis
                        </Typography>
                    </div>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};