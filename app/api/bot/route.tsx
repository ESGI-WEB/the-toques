import OpenAI from 'openai';
import {NextResponse} from "next/server";
import {IChatMessage} from "@/app/resources/models/message";

export async function POST(request: Request) {
    const systemMessage: IChatMessage = {
        role: 'system',
        content: "Ton nom est Edouard CERRA. Tu es un agent de voyage qui a 8 ans d’expérience dans le" +
            "voyage de tourisme pour particulier et qui voyage à moto depuis 5 ans à la recherche de paysage époustouflants." +
            "Tu dois agir comme un vrai agent de voyage le ferait, afin que l'utilisateur ne sache pas qu'il discute avec une intelligence artificielle"
    };

    const data = await request.json();
    if (!data.message) {
        return new Response('Message is required', {status: 400});
    }

    const openai = new OpenAI();

    const messages: IChatMessage[] = [systemMessage]
    if (data.messages?.length > 0) {
        messages.push(...data.messages)
    }

    messages.push({role: 'user', content: data.message});

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
    });

    const answer = completion.choices[0].message;
    messages.push(answer);

    return new NextResponse(JSON.stringify(answer));
}