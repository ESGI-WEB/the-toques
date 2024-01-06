"use client";

import React from 'react';
import {Card, CardActionArea, CardContent, CardMedia, Rating, Typography} from '@mui/material';
import {Recipe} from "@/app/resources/models/recipe.model";
import {useRouter} from "next/navigation";
import RecipeLike from "@/app/resources/components/RecipeLike";
import Chip from '@mui/material/Chip';

export default function RecipeCard(
    {
        recipe, onLikeChange = (recipe: Recipe) => {}, areCaloriesSorted = false
    }: {
        recipe: Recipe, onLikeChange?: any, areCaloriesSorted?: boolean
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
                {recipe.calories && areCaloriesSorted && (
                    <Chip className="absolute right-10 top-10" size="small" label={`${recipe.calories} cal`} />
                )}
                <CardMedia
                    component="img"
                    alt={recipe.title}
                    height="140"
                    image={recipe.image}
                />
                <CardContent>
                    <Typography variant="h5" component="div">
                        {recipe.title}
                    </Typography>
                    <div className="flex flex-row flex-items-center flex-justify-space-between">
                        <div className="flex flex-row flex-items-center gap-10">
                            <Typography variant="body2" color="text.secondary">
                                <Rating readOnly precision={0.5} value={recipe.marksAvg}/>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {recipe.marksCount} avis
                            </Typography>
                        </div>
                        {('isLiked' in recipe) && <RecipeLike recipe={recipe} onChange={onLikeChange}/>}
                    </div>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};