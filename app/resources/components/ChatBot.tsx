import {Fab} from "@mui/material";
import {ChatOutlined} from "@mui/icons-material";
import React, {useState} from "react";
import {useApi} from "@/app/resources/services/useApi";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import BotMessage from "@/app/resources/components/BotMessage";
import {IChatMessage} from "@/app/resources/models/message";
import CenteredModal from "@/app/resources/components/CenteredModal";

export default function ChatBot() {
    const api = useApi();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<IChatMessage[]>([
        {content: "Bonjour, je suis Jean Bon, comment puis-je vous aider ?", role: 'assistant'}
    ] as IChatMessage[]);
    const [error, setError] = useState<string | null>(null);

    function addMessage(message: IChatMessage) {
        setMessages(messages => [...messages, message])
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    function getMessageVariant(message: IChatMessage) {
        switch (message.role) {
            case 'user':
                return 'primary';
            case 'assistant':
            default:
                return 'secondary';
        }
    }

    const send = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const message = input;

        if (!message || !message.trim()) {
            setError('Tout-dabord, écrivez un message');
            return;
        }

        setInput('');
        setError(null);
        addMessage({content: input, role: 'user'});
        setIsLoading(true);
        scrollModalToBottom();

        api('bot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message, messages})
        }).then((message: IChatMessage) => {
            addMessage(message);
            scrollModalToBottom();
        }).catch(() => {
            setError('Une erreur est survenue');
        }).finally(() => {
            setIsLoading(false);
        });
    }

    const scrollModalToBottom = () => {
        const modal = document.querySelector('.modal-container');
        if (!modal) return;
        setTimeout(() => modal.scrollTo(0, modal.scrollHeight), 1); // after render
    }

    return (
        <div className="chatbot">
            <Fab color="primary" onClick={handleOpen}>
                <ChatOutlined />
            </Fab>
            <CenteredModal
                open={open}
                onClose={handleClose}
            >
                <div>
                    {messages.map((message, index) => (
                        <BotMessage message={message} key={index} variant={getMessageVariant(message)}>
                            {message.content}
                        </BotMessage>
                    ))}
                </div>
                <form className="flex gap-20 margin-top-40" onSubmit={(e) => send(e)}>
                    <TextField
                        label="Message"
                        variant="outlined"
                        value={input}
                        onChange={handleInput}
                        fullWidth
                        error={!!error}
                        helperText={error}
                    />
                    <LoadingButton
                        loading={isLoading}
                        variant="contained"
                        color="primary"
                        type='submit'
                    >
                        Envoyer
                    </LoadingButton>
                </form>
            </CenteredModal>
        </div>
    )
}