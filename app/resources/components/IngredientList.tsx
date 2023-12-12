import {Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import React, {useState} from "react";
import {Ingredient, Recipe} from "@/app/resources/models/recipe.model";
import Grid from "@mui/material/Grid";

export default function IngredientList({recipe}: { recipe: Recipe}) {
    const [checkedIngredients, setCheckedIngredients] = useState<Ingredient[]>([]);

    const handleIngredientToggle = (ingredient: Ingredient) => () => {
        const currentIndex = checkedIngredients.indexOf(ingredient);
        const newChecked = [...checkedIngredients];

        if (currentIndex === -1) {
            newChecked.push(ingredient);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setCheckedIngredients(newChecked);
    }

    return (
        <Grid sx={{
            width: 250,
        }}>
            <List>
                {recipe.ingredients.map((ingredient, index) => (
                    <ListItem key={ingredient.id} sx={{
                        padding: 0,
                    }}>
                        <ListItemButton onClick={handleIngredientToggle(ingredient)}>
                            <ListItemIcon sx={{
                                minWidth: 42,
                            }}>
                                <Checkbox
                                    edge="start"
                                    tabIndex={-1}
                                    checked={checkedIngredients.indexOf(ingredient) !== -1}
                                    disableRipple
                                    inputProps={{'aria-labelledby': 'ingredient_' + ingredient.id}}
                                />
                            </ListItemIcon>
                            <ListItemText id={'ingredient_' + ingredient.id} primary={
                                <span>
                                    <strong>{ingredient.quantity} </strong>
                                    {ingredient.name}
                                </span>
                            }>
                            </ListItemText>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Grid>
    )
}