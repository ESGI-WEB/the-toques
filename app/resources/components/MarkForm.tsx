"use client";
import {useState} from 'react';
import {Paper, Rating} from '@mui/material';
import {useForm} from "react-hook-form";
import TextField from "@mui/material/TextField";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import {useApi} from "@/app/resources/services/useApi";
import {Mark} from "@/app/resources/models/recipe.model";

export default function MarkForm(
    {
        recipeId,
        onCreated = (mark: Mark) => void 0,
    }: {
        recipeId: number;
        onCreated: any;
    }
) {
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const {register, handleSubmit, setValue, formState: {errors,}} = useForm({
        defaultValues: {
            title: '',
            content: '',
            mark: 4,
        },
    });

    const onSubmit = async (data: {
        title: string;
        content: string;
        mark: number;
    }) => {
        setLoading(true);
        setError(null);
        api(`recipes/${recipeId}/marks`, {
            method: 'POST',
            body: JSON.stringify(data),
        }).then((res) => {
            onCreated && onCreated(res);
        }).catch((err) => {
            console.error(err);
            setError(err.error?.[0]?.message ?? "Une erreur est survenue lors de l'enregistrement de votre avis.");
        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <Paper className="padding-20">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-10">
                <div>
                    <Typography>Note</Typography>
                    <Rating
                        name="mark"
                        defaultValue={4}
                        precision={1}
                        onChange={(event, newValue) => {
                            setValue('mark', newValue ?? 1);
                        }}
                    />
                </div>
                <TextField
                    {...register("title")}
                    label="Titre"
                    variant="outlined"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                />
                <TextField
                    {...register("content")}
                    label="Commentaire"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                />

                <LoadingButton
                    size="small"
                    loading={loading}
                    type="submit"
                    loadingIndicator="Enregistrement en cours..."
                    variant="outlined"
                >
                    Ajouter un avis
                </LoadingButton>

                {error !== null && (
                    <Typography color="error">{error}</Typography>
                )}
            </form>
        </Paper>
    );
};
