import {PrismaClient} from "@prisma/client";
import {IChatMessage} from "@/app/resources/models/message";
import OpenAI from "openai";
import {
    getRecipesWithAvg,
    getRecipesWithIsLiked,
} from "@/prisma/utils";
import {isAuthenticated} from "@/app/libs/auth";

export async function GET(request: Request) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const search = new URL(request.url).searchParams;
    const characters = search.get('characters') ?? '';

    const sendEvent = (data: object) => {
        writer.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({ message: 'received' });

    setTimeout(() => streamRecipes(writer, request, sendEvent, characters));

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

const streamRecipes = async (writer: WritableStreamDefaultWriter, request: Request, sendEvent: any, characters = '' ) => {
    const prisma = new PrismaClient();

    const user = await isAuthenticated(request);

    const recipes = await prisma.recipe.findMany({
        select: {
            id: true,
            title: true,
            ingredients: {
                select: {
                    name: true,
                }
            },
        },
        take: 100,
    });

    if (!recipes) {
        await prisma.$disconnect();
        await sendEvent([]);
        await writer.close();
        return;
    }

    const systemMessage: IChatMessage = {
        role: 'system',
        content:
            `Avec cette liste de recettes : ` +
            `Recherche pour moi les id des recettes correspondant à : ${characters}.` +
            `Renvoi un tableau JSON contenant uniquement les id des recettes correspondantes, triées par pertinence ou un tableau vide.` +
            `Ta réponse doit avoir la forme [1, 2, 3, ...] uniquement sans rien d'autre` +
            `${recipes.map(recipe => `[id: ${recipe.id}, titre: ${recipe.title}], ingrédients: ${recipe.ingredients.map(ingredient => ingredient.name).join(', ')}]`).join(', ')}. `
    };

    if (user) {
        const userDetails = await prisma.user.findUnique({
            where: {
                id: user.id,
            }
        });
        if (userDetails?.preferences) {
            systemMessage.content += ". Voici les préférences alimentaires que l'utilisateur a renseigné sur le site : " + userDetails.preferences + ". Prends en compte ces préférences dans tes réponses si possible."
        }
    }

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage as any],
    });

    let recipeIds = []
    try {
        recipeIds = JSON.parse(completion.choices[0].message.content ?? '');
    } catch {}

    if (!recipeIds || !Array.isArray(recipeIds)) {
        await prisma.$disconnect();
        await sendEvent([]);
        await writer.close();
        return;
    }

    let recipesSelected = [];
    recipesSelected = await prisma.recipe.findMany({
        where: {
            id: {
                in: recipeIds.map(id => parseInt(id)),
            }
        },
    });

    recipesSelected = await getRecipesWithAvg(recipesSelected, prisma);
    if (user) {
        recipesSelected = await getRecipesWithIsLiked(recipesSelected, prisma, user.id);
    }

    sendEvent(recipesSelected);

    await prisma.$disconnect();
    await writer.close();
}
