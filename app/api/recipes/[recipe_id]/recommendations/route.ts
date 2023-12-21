import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {IChatMessage} from "@/app/resources/models/message";
import OpenAI from "openai";
import {
    getRecipesWithAvg,
    getRecipesWithIsLiked,
} from "@/prisma/utils";
import {isAuthenticated} from "@/app/libs/auth";

export async function GET(request: Request, {params}: { params: { recipe_id: string } }) {
    const prisma = new PrismaClient();
    const recipeId = Number(params.recipe_id);
    const recipe = await prisma.recipe.findUnique({
        where: {
            id: recipeId,
        },
        include: {
            ingredients: true,
        }
    });
    const user = await isAuthenticated(request);

    if (!recipe) {
        await prisma.$disconnect();
        return new NextResponse(null, {status: 404});
    }

    const similarRecipes = await prisma.recipe.findMany({
        where: {
            id: {
                not: recipeId,
            },
            ingredients: {
                some: {
                    name: {
                        in: recipe.ingredients.map(ingredient => ingredient.name),
                    }
                }
            },
        },
        select: {
            id: true,
            title: true,
            ingredients: {
                select: {
                    name: true,
                }
            },
        },
        take: 30,
    });
    console.log(similarRecipes)

    const systemMessage: IChatMessage = {
        role: 'system',
        content: `Étant donné la recette : "${recipe.title}" `+
            `avec comme ingrédients : "${recipe.ingredients.map(ingredient => ingredient.name).join(', ')}". `+
            `Choisis parmi les recettes suivantes celles qui sont le plus similaire à la recette précédente. ` +
            `Retourne les 4 plus similaires dans un tableau contenant uniquement la valeur du id en JSON. ` +
            `Si il y a moins de 4 recettes similaires, envoie en moins, s'il n'y en a pas, renvoi [].` +
            `Voici la liste de recettes parmis lesquelles tu dois choisir les id. Le content de ta réponse doit uniquement contenir le tableau de la forme [number, number, ...]. `+
            `Renvoi uniquement le tableau JSON des valeurs des ids avec les plus similaires en premier. ` +
            similarRecipes.map(recipe => `[id: ${recipe.id}, titre: ${recipe.title}, ingrédients: ${recipe.ingredients.map(ingredient => ingredient.name).join(', ')}]`)
                .join(', ')
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
    console.log(completion.choices[0].message)

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
    console.log({recipesSelected})

    recipesSelected = await getRecipesWithAvg(recipesSelected, prisma);
    if (user) {
        recipesSelected = await getRecipesWithIsLiked(recipesSelected, prisma, user.id);
    }

    await prisma.$disconnect();
    return new NextResponse(JSON.stringify(recipesSelected), {status: 200});
}