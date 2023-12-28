"use client";

import React, {useEffect, useState} from "react";
import {useApi} from "@/app/resources/services/useApi";
import {Recipe} from "@/app/resources/models/recipe.model";
import RecipeCard from "@/app/resources/components/RecipeCard";
import Typography from "@mui/material/Typography";
import {getCurrentSeason} from "@/app/libs/utils";
import {CircularProgress} from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ToggleElements, {Filter} from "@/app/resources/components/ToggleElements";

export default function Recipes() {
    const api = useApi();
    const [recipes, setRecipes] = useState<Recipe[] | null>(null)
    const [seasonRecipes, setSeasonRecipes] = useState<Recipe[] | null>(null)
    const season = getCurrentSeason();
    const [isCaloriesSorted, setIsCaloriesSorted] = useState(false);

    useEffect(() => {
        api('recipes').then(setRecipes);
        api('recipes/season').then(setSeasonRecipes);
    }, []);

    const filters: Filter[] = [
        {
            label: "Trier par calories",
            name: "calories",
        },
    ];

    const handleToggleChange = (name: string, checked: boolean) => {
        if (name === 'calories' && recipes !== null && seasonRecipes !== null) {
            setIsCaloriesSorted(checked);
            setRecipes(recipes.sort((a, b) => {
                if (checked) {
                    if (a.calories < b.calories) {
                        return -1;
                    }
                    return 0;
                } else {
                    if (a.id < b.id) {
                        return -1;
                    }
                    return 0;
                }
            }));
            setSeasonRecipes(seasonRecipes?.sort((a, b) => {
                if (checked) {
                    if (a.calories < b.calories) {
                        return -1;
                    }
                    return 0;
                } else {
                    if (a.id < b.id) {
                        return -1;
                    }
                    return 0;
                }
            }));
        }
    }

    return (
        <>
            {(seasonRecipes === null || seasonRecipes.length > 0) &&
                <>
                    <div className="flex flex-row flex-justify-space-between margin-y-20">
                        <Typography variant="h1" gutterBottom>
                            {season.icon} {season.title} {season.icon}
                        </Typography>
                        <ToggleElements title="Filtres" filters={filters} onToggleChange={handleToggleChange} />
                    </div>
                    <div className="flex p-24 gap-30 flex-wrap">
                        {seasonRecipes === null && <div className="flex flex-center gap-20 flex-column">
                            <CircularProgress/>
                            <Typography>Nous recherchons nos recettes de saison...</Typography>
                        </div>}
                        {seasonRecipes !== null && seasonRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} isCaloriesSorted={isCaloriesSorted}/>
                        ))}
                    </div>
                </>
            }

            <div className="margin-y-20">
                <Typography  variant="h1" gutterBottom>
                    Nos recettes
                </Typography>
            </div>
            <div className="flex p-24 gap-30 flex-wrap">
                {recipes === null && <div className="flex flex-center gap-20 flex-column">
                    <CircularProgress/>
                    <Typography>Qu&apos;allez vous cuisiner aujourd&apos;hui ? Vous allez très vite le savoir</Typography>
                </div>}
                {recipes !== null && recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} isCaloriesSorted={isCaloriesSorted}/>
                ))}
                {recipes !== null && recipes.length === 0 &&
                    <Typography>Aucune recette correspondante <SentimentDissatisfiedIcon/></Typography>
                }
            </div>
        </>
    )
}
