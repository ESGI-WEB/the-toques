import React, { useEffect, useState } from "react";
import KeyboardVoiceRoundedIcon from '@mui/icons-material/KeyboardVoiceRounded';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useRouter } from "next/navigation";
import MicOffIcon from '@mui/icons-material/MicOff';

export default function AudioSearch({
    onTranscriptChange = (transcript: string) => { },
}) {
    const router = useRouter();
    const [isSpeechRecognitionInitialized, setIsSpeechRecognitionInitialized] = useState(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        setIsSpeechRecognitionInitialized(true);
    }, []);

    useEffect(() => {
        if (!listening && transcript) {
            router.push('/search?characters=' + encodeURIComponent(transcript));
        }
    }, [listening, transcript, resetTranscript, router]);

    useEffect(() => {
        onTranscriptChange(transcript);
    }, [transcript]);

    const handleVoiceIconClick = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening();
        }
    };

    if (!isSpeechRecognitionInitialized) {
        return null;
    }

    if (browserSupportsSpeechRecognition === false) {
        return (
            <MicOffIcon />
        );
    }

    return (
        <KeyboardVoiceRoundedIcon
            className={`cursor-pointer ${listening ? 'zoom-infinite' : ''}`}
            onClick={handleVoiceIconClick}
        />
    );
}