import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import copy from 'clipboard-copy';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import parse from 'html-react-parser';
import {useEffect, useState} from "react";
import {CircularProgress, Snackbar, TextField} from '@mui/material';
import {useApi} from "@/app/resources/services/useApi";
import {useParams} from "next/navigation";
import Typography from "@mui/material/Typography";
import {Recipe} from "@/app/resources/models/recipe.model";

export default function DialogShopping({
    open,
    onClose,
    recipe
}: { open: boolean, onClose: () => void, recipe: Recipe}) {
    const params = useParams();
    const [platesDefined, setPlatesDefined] = useState<number|null>(recipe.plates);
    const [title, setTitle] = useState<string|null>(null);
    const [shoppingList, setShoppingList] = useState<string|null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [notification, setNotification] = useState<string|null>(null);
    const api = useApi();
    const recipeId = +params.recipe_id;

    useEffect(() => {
        setTitle(`Liste de courses pour ${recipe.plates} portions`);
        searchShoppingList();
    }, []);

    const handleCopyToClipboard = () => {
        if (!shoppingList) {
            return;
        }
        try {
            copy(formatListStripHtml(shoppingList));
            setNotification("Contenu copié dans le presse-papiers !");
        } catch (error) {
            console.error('Erreur lors de la copie dans le presse-papiers :', error);
            setNotification("Erreur lors de la copie dans le presse-papiers. Veuillez réessayer.");
        }
    };

    const handleShareOnSocialMedia = () => {
        if (!shoppingList || !title) {
            return;
        }

        navigator.share({
            title: title,
            text: formatListStripHtml(shoppingList),
            url: window.location.href
        });
    };

    const handleSendByEmail = () => {
        if (!shoppingList || !title) {
            return;
        }
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(formatListStripHtml(shoppingList))}`;
    };

    const formatListStripHtml = (list: string) => {
        return list.replace(/<li>/g, '- ')
            .replace(/<\/li>/g, '\n')
            .replace(/<[^>]*>/g, '');
    }

    const handlePortionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlatesDefined(Number(event.target.value));
    };

    const searchShoppingList = () => {
        setShoppingList("");
        setError(false);
        setLoading(true);
        setTitle(`Liste de courses pour ${platesDefined} portions`);

        api(`recipes/` + recipeId+ '/shopping', {
            method: 'POST',
            body: JSON.stringify(
                {
                    "numberPlates": platesDefined
                })
        })
        .then((shoppingList) => {
            setShoppingList(shoppingList.content);
        }).catch((err) => {
            console.error(err);
            setError(err.error?.[0]?.message ?? "Une erreur est survenue lors de la génération de la liste de courses.");
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" className="margin-y-30">
                    {title}
                </DialogTitle>
                <DialogContent>
                    <div className="flex flex-row margin-y-20 gap-20">
                        <TextField
                            size="small"
                            variant="standard"
                            type="number"
                            label="Nombre de portions"
                            value={platesDefined || ''}
                            onChange={handlePortionsChange}
                        />
                        <Button variant="contained" size="small" onClick={() => searchShoppingList()}>
                            Générer la liste
                        </Button>
                    </div>
                    <DialogContentText id="alert-dialog-description">
                        {loading && <CircularProgress />}
                        {shoppingList != null ? (
                            parse(shoppingList)
                        ) : null}
                        {error !== null && (
                            <Typography color="error">{error}</Typography>
                        )}
                    </DialogContentText>
                </DialogContent>
                {shoppingList != null && (
                    <DialogActions>
                        {navigator.clipboard &&
                            <Button onClick={handleCopyToClipboard}>
                                <ContentPasteOutlinedIcon/>
                            </Button>
                        }
                        {navigator['share'] &&
                            <Button onClick={handleShareOnSocialMedia}>
                                <IosShareOutlinedIcon/>
                            </Button>
                        }
                        <Button onClick={handleSendByEmail}>
                            <EmailOutlinedIcon />
                        </Button>
                        <Button onClick={onClose}>Fermer</Button>
                    </DialogActions>
                )}
            </Dialog>
            <Snackbar
                open={notification !== null}
                autoHideDuration={5000}
                onClose={() => setNotification(null)}
                message={notification}
            />
        </>
    );
}
