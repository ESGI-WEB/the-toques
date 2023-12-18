import Modal from '@mui/material/Modal';
import Box from "@mui/material/Box";
import React from "react";
import IconButton from "@mui/material/IconButton";
import {Close} from "@mui/icons-material";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '8px',
    p: 6,
    maxHeight: '80vh',
    maxWidth: '1000px',
    overflow: 'auto',
};

export default function CenteredModal(
    {
        open,
        onClose,
        children,
    }: {
        open: boolean,
        onClose: () => void,
        children: React.ReactNode,
    }
) {
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box
                sx={style}
                className={'modal-container'}
            >
                <IconButton onClick={onClose} sx={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                }}>
                    <Close></Close>
                </IconButton>
                {children}
            </Box>
        </Modal>
    )
}