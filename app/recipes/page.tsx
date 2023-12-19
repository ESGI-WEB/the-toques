"use client";

import React, {useEffect, useState} from "react";
import {useApi} from "@/app/resources/services/useApi";
import {Recipe} from "@/app/resources/models/recipe.model";
import RecipeCard from "@/app/resources/components/RecipeCard";
import Typography from "@mui/material/Typography";
import {getCurrentSeason} from "@/app/libs/utils";
import {CircularProgress} from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

export default function Recipes() {
    const api = useApi();
    const [recipes, setRecipes] = useState<Recipe[] | null>(null)
    const [seasonRecipes, setSeasonRecipes] = useState<Recipe[] | null>(null)
    const season = getCurrentSeason();

    useEffect(() => {
        api('recipes').then(setRecipes);
        api('recipes/season').then(setSeasonRecipes);
    }, []);

    return (
        <>
            {(seasonRecipes === null || seasonRecipes.length > 0) &&
                <>
                    <Typography variant="h1" gutterBottom>
                        {season.icon} {season.title} {season.icon}
                    </Typography>
                    <div className="flex p-24 gap-30 flex-wrap margin-bottom-30">
                        {seasonRecipes === null && <div className="flex flex-center gap-20 flex-column">
                            <CircularProgress/>
                            <Typography>Nous recherchons nos recettes de saison...</Typography>
                        </div>}
                        {seasonRecipes !== null && seasonRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe}/>
                        ))}
                    </div>
                </>
            }

            <Typography variant="h1" gutterBottom>
                Nos recettes
            </Typography>
            <div className="flex p-24 gap-30 flex-wrap">
                {recipes === null && <div className="flex flex-center gap-20 flex-column">
                    <CircularProgress/>
                    <Typography>Qu'allez vous cuisiner aujourd'hui ? Vous allez très vite le savoir</Typography>
                </div>}
                {recipes !== null && recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe}/>
                ))}
                {recipes !== null && recipes.length === 0 &&
                    <Typography>Aucune recette correspondante <SentimentDissatisfiedIcon/></Typography>
                }
            </div>
        </>
    )
}
