import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {IChatMessage} from "@/app/resources/models/message";
import OpenAI from "openai";
import {
    getRecipesWithAvg,
    getRecipesWithIsLiked,
} from "@/prisma/utils";
import {isAuthenticated} from "@/app/libs/auth";

export async function POST(request: Request) {
    const prisma = new PrismaClient();

    const user = await isAuthenticated(request);

    const recipes = await prisma.recipe.findMany({
        select: {
            id: true,
            title: true,
        },
        take: 100,
    });

    const systemMessage: IChatMessage = {
        role: 'system',
        content:
            `Imaginez que vous disposez d'une liste de recettes avec les informations suivantes : "${recipes.map(recipe => `[id: ${recipe.id}, titre: ${recipe.title}]`).join(', ')}". ` +
            `Imagine les étapes et les ingrédients associés à chaque titre de recette.` +
            `Ensuite, recherche et affiche les IDs des recettes contenant : ${request}. ` +
            `Le résultat final doit être un tableau JSON contenant uniquement les valeurs des IDs des recettes, triées par pertinence (le nombre de correspondances), avec les recettes les plus pertinentes en premier.` +
            `Si aucune recette ne contient ces ingrédients, le programme doit renvoyer un tableau vide []. ` +
            `La réponse finale doit être un tableau sous la forme [number, number, ...].`
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
        return new NextResponse(JSON.stringify([]), {status: 200});
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

    await prisma.$disconnect();
    return NextResponse.json(recipesSelected, {status: 200});
}