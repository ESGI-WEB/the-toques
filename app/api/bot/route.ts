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
            systemMessage.content += "L'utilisateur avec lequel tu communiques s'appelle " + userDetails.firstName + "."
            if (userDetails.preferences) {
                systemMessage.content += "Voici les préférences alimentaires qu'il a renseigné sur le site : " + userDetails.preferences + ". Prends en compte ces préférences dans tes réponses."
            }
        }

    }

    // check if request has a ?recipeId so we get the recipe details and use it in the bot
    const url = new URL(request.url);
    const recipeId = url.searchParams.get('recipeId');
    if (recipeId) {
        const recipe = await prisma.recipe.findUnique({
            where: {
                id: parseInt(recipeId),
            },
            include: {
                ingredients: true,
                steps: true,
            }
        });
        if (recipe) {
            systemMessage.content += "L'utilisateur est actuellement sur une page de recette, s'il te pose des questions dessus, voila le détail de la recette qu'il voit : ";
            systemMessage.content += "La recette s'appelle " + recipe.title + ". ";
            systemMessage.content += "Pour " + recipe.plates + " plats. ";
            systemMessage.content += "Les ingredients de la recette : " + recipe.ingredients.map(ingredient => ingredient.quantity + ' ' + ingredient.name) + ". ";
            systemMessage.content += "Les étapes de la recette : " + recipe.steps.map(step => step.name + ' : ' + step.description) + ". ";
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