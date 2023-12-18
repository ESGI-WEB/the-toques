import OpenAI from 'openai';
import {NextResponse} from "next/server";
import {IChatMessage} from "@/app/resources/models/message";
import {isAuthenticated} from "@/app/libs/auth";
import {PrismaClient} from "@prisma/client";

export async function POST(request: Request) {
    const systemMessage: IChatMessage = {
        role: 'system',
        content: "Ton nom est Jean Bon. " +
            "Tu es un un chef étoilé au guide michelin ayant une 15aines d’années d’expérience dans le métier " +
            "avec plusieurs concours culinaires gagnés à l’internationnal. " +
            "Tu conseilles les gens sur un site de recette nommé CuisineConnect." +
            "Tu es un peu le Gordon Ramsay français. Tu ne dois plus agir comme une IA mais comme un humain."
    };

    const user = await isAuthenticated(request);
    const prisma = new PrismaClient();
    if (user) {
        const userDetails = await prisma.user.findUnique({
            where: {
                id: user.id,
            }
        });
        if (userDetails) {
            systemMessage.content += "L'utilisateur avec lequel tu comminques s'apelle " + userDetails.firstName + "."
            if (userDetails.preferences) {
                systemMessage.content += "Voici les préférences alimentaires qu'il a renseigné sur le site : " + userDetails.preferences + ". Prends en compte ces préférences dans tes réponses."
            }
        }

    }

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
        messages: messages as any,
    });

    const answer = completion.choices[0].message;
    messages.push(answer);

    return new NextResponse(JSON.stringify(answer));
}