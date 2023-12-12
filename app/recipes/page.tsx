"use client";

import React, {useEffect, useState} from "react";
import {useApi} from "@/app/resources/services/useApi";
import {Recipe} from "@/app/resources/models/recipe.model";
import RecipeCard from "@/app/resources/components/RecipeCard";
import Typography from "@mui/material/Typography";

export default function Recipes() {
    const api = useApi();
    const [recipes, setRecipes] = useState<Recipe[]>([])

    useEffect(() => {
        api('recipes').then(setRecipes);
    }, []);

    return (
        <>
            <Typography variant="h4" component="h3" gutterBottom>
                Nos recettes
            </Typography>
            <div className="flex p-24 gap-30 flex-wrap">
                {recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe}/>
                ))}
            </div>
        </>
    )
}
