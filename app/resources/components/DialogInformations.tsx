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

export default function DialogInformations({ open, onClose, title, content }) {

    const handleCopyToClipboard = () => {
        try {
            copy(content);
            alert("Contenu copié dans le presse-papiers !");
        } catch (error) {
            console.error('Erreur lors de la copie dans le presse-papiers :', error);
            alert("Erreur lors de la copie dans le presse-papiers. Veuillez réessayer.");
        }
    };

    const handleShareOnSocialMedia = () => {
        const shareUrl = encodeURIComponent(window.location.href);
        const shareTitle = encodeURIComponent(title);
        const shareDescription = encodeURIComponent(content);
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&title=${shareTitle}&description=${shareDescription}`;

        window.open(facebookShareUrl, '_blank');
    };

    const handleSendByEmail = () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(content)}`;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {parse(content)}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCopyToClipboard}>
                    <ContentPasteOutlinedIcon />
                </Button>
                <Button onClick={handleShareOnSocialMedia}>
                    <IosShareOutlinedIcon />
                </Button>
                <Button onClick={handleSendByEmail}>
                    <EmailOutlinedIcon />
                </Button>
                <Button onClick={onClose}>Fermer</Button>
            </DialogActions>
        </Dialog>
    );
}
