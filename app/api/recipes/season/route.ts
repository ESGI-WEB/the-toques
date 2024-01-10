import {NextResponse} from "next/server";
import {isAuthenticated} from "@/app/libs/auth";
import {PrismaClient} from "@prisma/client";
import {getRecipesMoreLiked, getRecipesWithAvg, getRecipesWithIsLiked} from "@/prisma/utils";
import {IChatMessage} from "@/app/resources/models/message";
import OpenAI from "openai";
import {getCurrentSeason} from "@/app/libs/utils";

export async function GET(request: Request) {
    const prisma = new PrismaClient();
    const season = getCurrentSeason();
    const user = await isAuthenticated(request);

    const recipesSetIds = await getRecipesMoreLiked(prisma);
    if (!recipesSetIds || recipesSetIds.length < 0) {
        await prisma.$disconnect();
        return NextResponse.json([], {status: 200});
    }
    const recipesSet = (await prisma.recipe.findMany({
        where: {
            id: {
                in: recipesSetIds,
            }
        },
        include: {
            ingredients: true,
        }
    })).map(recipe => `[id: ${recipe.id}, titre: ${recipe.title}, ingrédients: ${recipe.ingredients.map(ingredient => ingredient.name).join(', ')}]`);

    const systemMessage: IChatMessage = {
        role: 'system',
        content: `Parmi les recettes suivantes, choisis-en au minimum 4 et au maximum 6 qui sont plutôt de la saison : "${season.name}" en France métropolitaine. 
            Base-toi sur les ingrédients de chaque recette et leur nom, qui doit être en lien avec la saison donnée.
            Par exemple, une soupe de butternut sera adaptée pour l'automne alors que des épinards sont plutôt d'été.
            Retourne les id des recettes choisies dans un tableau contenant uniquement la valeur du id en JSON de la forme [number, number, ...], les plus correspondantes devront apparaître en premier dans le tableau.
            Voici les recettes parmi lesquelles tu dois choisir. Renvoie uniquement le tableau JSON des valeurs des ids : ` +
            recipesSet,
    };

    if (user) {
        const userDetails = await prisma.user.findUnique({
            where: {
                id: user.id,
            }
        });
        if (userDetails?.preferences) {
            systemMessage.content += ". Voici les préférences alimentaires que l'utilisateur a renseigné sur le site : " + userDetails.preferences + ". Prends en compte ces préférences dans tes choix si possible."
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

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length < 0) {
        await prisma.$disconnect();
        return new NextResponse(JSON.stringify({message: 'Can not find season recipe'}), {status: 500});
    }

    let recipes = [];
    let findManyArgs = {}
    if (request.url.includes('calories=')) {
        const order = request.url.includes('calories=asc') ? 'asc' : 'desc';
        findManyArgs = {
            orderBy: {
                calories: order,
            }
        }
    }
    recipes = await prisma.recipe.findMany({
        where: {
            id: {
                in: recipeIds.map(id => parseInt(id)),
            }
        },
        ...findManyArgs,
    });

    recipes = await getRecipesWithAvg(recipes, prisma);
    if (user) {
        recipes = await getRecipesWithIsLiked(recipes, prisma, user.id)
    }

    await prisma.$disconnect();
    return NextResponse.json(recipes, {status: 200});
}