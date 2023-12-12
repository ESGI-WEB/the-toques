"use client";

import {useFieldArray, useForm} from 'react-hook-form';
import {Alert, Button, Input, TextField, Typography} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import {useApi} from "@/app/resources/services/useApi";
import {useState} from "react";
import Upload from "@/app/resources/components/Upload";

export default function CreateRecipe() {
    const defaultStep = {name: '', description: ''};
    const defaultIngredient = {name: '', quantity: ''};
    const api = useApi();
    const [showedError, setShowedError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {register, handleSubmit, control, formState: {errors}} = useForm({
        defaultValues: {
            title: '',
            plates: 4,
            ingredients: [defaultIngredient, defaultIngredient, defaultIngredient],
            steps: [defaultStep, defaultStep],
        },
    });

    const {fields: ingredientFields, append: appendIngredient, remove: removeIngredient} = useFieldArray({
        control,
        name: 'ingredients',
    });

    const {fields: stepFields, append: appendStep, remove: removeStep} = useFieldArray({
        control,
        name: 'steps',
    });

    const onSubmit = async (data: any) => {
        try {
            setShowedError(null);
            const image = selectedFile;
            if (image) {
                data.image = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(image);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
            }

            api('recipes', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then((res) => {
                window.location.href = '/recipes/' + res.id;
            }).catch((err) => {
                setShowedError(err.error[0].message);
            });
        } catch (error) {
            console.error('Validation error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-30 form">
            <div>
                <Typography variant="h1" className="margin-bottom-30">Créer une recette</Typography>
                <div className="flex flex-column gap-30">
                    <TextField
                        label="Titre de la recette"
                        type="text"
                        id="title"
                        {...register('title', {required: true})}
                        fullWidth
                        error={Boolean(errors?.title)}
                        helperText={Boolean(errors?.title) ? 'Champ invalide' : ''}
                    />
                    <TextField
                        label="Nombre de plats"
                        type="number"
                        id="nbPlates"
                        {...register('plates', {required: true})}
                        fullWidth
                        error={Boolean(errors?.plates)}
                        helperText={Boolean(errors?.plates) ? 'Champ invalide' : ''}
                    />
                    <Upload
                        onFileChange={(file) => {
                            setSelectedFile(file);
                        }}
                    />
                </div>
            </div>
            <div>
                <Typography variant="h2" className="margin-bottom-20">Ingrédients</Typography>
                {ingredientFields.map((ingredient, index) => (
                    <div key={index} className='flex gap-10 margin-bottom-10'>
                        <TextField
                            sx={{width: '40%'}}
                            label="Quantité"
                            type="text"
                            id={`ingredients[${index}].quantity`}
                            {...register(`ingredients.${index}.quantity`, {required: true})}
                            fullWidth
                            error={Boolean(errors?.ingredients?.[index]?.quantity)}
                            helperText={Boolean(errors?.ingredients?.[index]?.quantity) ? 'Champ invalide' : ''}
                        />
                        <TextField
                            label="Nom"
                            type="text"
                            id={`ingredients[${index}].name`}
                            {...register(`ingredients.${index}.name`, {required: true})}
                            fullWidth
                            error={Boolean(errors?.ingredients?.[index]?.name)}
                            helperText={Boolean(errors?.ingredients?.[index]?.name) ? 'Champ invalide' : ''}
                        />
                        {ingredientFields.length > 1 &&
                            <Grid>
                                <IconButton onClick={() => removeIngredient(index)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Grid>
                        }
                    </div>
                ))}

                <Button variant="outlined" onClick={() => appendIngredient(defaultIngredient)}
                        startIcon={<AddIcon/>}>
                    Ajouter un ingrédient
                </Button>
            </div>

            <div>
                <Typography variant="h2" className="margin-bottom-20">Étapes</Typography>
                {stepFields.map((step, index) => (
                    <div key={index} className="flex gap-10 margin-bottom-30">
                        <div className="full-width flex flex-column gap-10">
                            <p>Étape n°{index + 1}</p>
                            <TextField
                                label="Nom"
                                type="text"
                                id={`steps[${index}].name`}
                                {...register(`steps.${index}.name`, {required: true})}
                                fullWidth
                                error={Boolean(errors?.steps?.[index]?.name)}
                                helperText={Boolean(errors?.steps?.[index]?.name) ? 'Champ invalide' : ''}
                            />
                            <TextField
                                label="Description"
                                id={`steps[${index}].description`}
                                multiline
                                rows={4}
                                {...register(`steps.${index}.description`, {required: true})}
                                fullWidth
                                error={Boolean(errors?.steps?.[index]?.description)}
                                helperText={Boolean(errors?.steps?.[index]?.description) ? 'Champ invalide' : ''}
                            />
                        </div>

                        {stepFields.length > 1 &&
                            <Grid>
                                <IconButton onClick={() => removeStep(index)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Grid>
                        }
                    </div>
                ))}

                <Button variant="outlined" onClick={() => appendStep(defaultStep)} startIcon={<AddIcon/>}>
                    Ajouter une étape
                </Button>
            </div>

            {showedError &&
                <Alert severity="error">
                    {showedError}
                </Alert>
            }

            <Button type="submit" variant="contained" color="primary">
                Ajouter la recette
            </Button>
        </form>
    );
}
