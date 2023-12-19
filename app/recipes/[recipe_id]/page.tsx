"use client";

import React, {useEffect, useState} from 'react';
import {
    CircularProgress,
    Container, Rating,
    Typography
} from '@mui/material';
import {useApi} from "@/app/resources/services/useApi";
import {useParams} from "next/navigation";
import {Mark, Recipe} from "@/app/resources/models/recipe.model";
import './style.css';
import IngredientList from "@/app/resources/components/IngredientList";
import MarkCard from "@/app/resources/components/MarkCard";
import MarkForm from "@/app/resources/components/MarkForm";
import RecipeLike from "@/app/resources/components/RecipeLike";
import RecipeDelete from "@/app/resources/components/RecipeDelete";
import RecipeCard from "@/app/resources/components/RecipeCard";
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export default function Recipe() {
    const params = useParams();
    const recipeId = +params.recipe_id;
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [recommendations, setRecommendations] = useState<Recipe[]|null>(null);
    const [marksWithText, setMarksWithText] = useState<Mark[]>([])
    const [sides, setSides] = useState<string[]|null>(null);
    const api = useApi();

    const setUpRecipe = (recipe: Recipe) => {
        setRecipe(recipe);
        setMarksWithText(recipe.marks.filter(mark => String(mark.content).trim().length > 0))
    }

    useEffect(() => {
        api('recipes/' + recipeId).then(setUpRecipe);
        api('recipes/' + recipeId + '/recommendations').then(setRecommendations);
        api('recipes/' + recipeId + '/sides').then(sides => setSides(sides.content.replace('\n', '<br>')));
    }, []);

    if (!recipe) {
        return (
            <CircularProgress/>
        );
    }

    return (
        <Container className="recipe-page flex flex-column gap-30">
            <div className="flex flex-wrap gap-20 align-items-center flex-space-between">
                <div className="flex gap-10">
                    <Typography variant="h1">{recipe.title}</Typography>
                    <div>
                        <RecipeLike recipe={recipe}/>
                        <RecipeDelete recipe={recipe}/>
                    </div>
                </div>
                <div className="flex gap-10 flex-items-center">
                    <Rating value={recipe.marksAvg} readOnly precision={0.5}/>
                    <span>{recipe.marksCount} avis</span>
                </div>
            </div>
            <div className='ingredient-with-image'>
                <img className="recipe-image" src={recipe.image} alt={recipe.title}/>
                <div className='ingredient-list'>
                    <Typography variant="h2">Ingredients</Typography>
                    <IngredientList recipe={recipe}/>
                </div>
            </div>


            <div>
                <Typography variant="h2">Etapes de la recette</Typography>
                <div className="flex flex-column gap-30 margin-top-20">
                    {recipe.steps.map((step, index) => (
                        <div className="flex flex-column gap-10" key={step.id}>
                            <Typography variant="h6">Etape n°{index + 1} : {step.name}</Typography>
                            <Typography>{step.description}</Typography>
                        </div>
                    ))}
                    <div>
                        <Typography variant="h6">Recommandation d'accompagnement</Typography>
                        {sides === null && <div className="flex flex-center gap-20 flex-column">
                            <CircularProgress/>
                            <Typography>Nous recherchons les meilleurs accompagnements pour cette recette...</Typography>
                        </div>}
                        {sides !== null &&
                            <Typography dangerouslySetInnerHTML={{__html: sides}}></Typography>
                        }
                    </div>
                </div>
            </div>

            <div>
                <Typography variant="h2" gutterBottom>Recommendations similaires</Typography>
                {recommendations === null && <div className="flex flex-center gap-20 flex-column">
                    <CircularProgress/>
                    <Typography>Nous recherchons les meilleurs recettes correspondantes</Typography>
                </div>}
                {recommendations !== null && recommendations.length === 0 &&
                    <Typography>Aucune recette correspondante <SentimentDissatisfiedIcon/></Typography>
                }
                <div className="flex flex-wrap gap-20">
                    {recommendations?.map(recommendation => (
                        <RecipeCard recipe={recommendation} key={recommendation.id}/>
                    ))}
                </div>
            </div>

            <div className="flex flex-column gap-20">
                <Typography variant="h2">Avis</Typography>
                <MarkForm
                    recipeId={recipeId}
                    onCreated={(mark: Mark) => {
                        setUpRecipe({
                            ...recipe,
                            marks: [mark, ...recipe.marks],
                        });
                    }}
                />
                {marksWithText.map(mark => (
                    <MarkCard mark={mark} key={mark.id}/>
                ))}
            </div>
        </Container>
    );
}