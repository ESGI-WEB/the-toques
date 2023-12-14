import Modal from '@mui/material/Modal';
import {Fab, Typography} from "@mui/material";
import {ChatOutlined} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {useState} from "react";
import {useApi} from "@/app/resources/services/useApi";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import BotMessage from "@/app/resources/components/BotMessage";
import {IChatMessage} from "@/app/resources/models/message";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '8px',
    p: 4,
};

export default function ChatBot() {
    const api = useApi();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<IChatMessage[]>([
        {content: "Bonjour, je suis Edouard CERRA, comment puis-je vous aider ?", role: 'assistant'}
    ] as IChatMessage[]);

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

    const send = () => {
        const message = input;

        if (!message || !message.trim()) {
            // addMessage({content: 'Tout-dabord, écrivez un message'}); // TODO
            return
        }

        setInput('');
        addMessage({content: input, role: 'user'});
        setIsLoading(true);

        api('bot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message, messages})
        }).then((message: IChatMessage) => {
            addMessage(message);
        }).catch(() => {
            // addMessage({content: 'Une erreur est survenue', role: 'error'});
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div className="chatbot">
            <Fab color="primary" onClick={handleOpen}>
                <ChatOutlined />
            </Fab>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div>
                        {messages.map((message, index) => (
                            <BotMessage message={message} key={index} variant={getMessageVariant(message)}>
                                {message.content}
                            </BotMessage>
                        ))}
                    </div>
                    <div className="flex">
                        <TextField
                            label="Message"
                            variant="outlined"
                            value={input}
                            onChange={handleInput}
                        />
                        <LoadingButton
                            loading={isLoading}
                            onClick={send}
                            variant="contained"
                            color="primary"
                        >
                            Envoyer
                        </LoadingButton>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}