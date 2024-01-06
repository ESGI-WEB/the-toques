import {Prisma, PrismaClient, Recipe} from '@prisma/client';
import OpenAI from "openai";
import {Ingredient} from "@/app/resources/models/recipe.model";

export async function getRecipesMoreLiked(prisma: PrismaClient, wheres: string[] = [], limit = 100): Promise<number[]> {
    const wheresSql = wheres.length ?
        Prisma.sql`WHERE ${Prisma.join(wheres, ' AND ')}` :
        Prisma.empty;

    return prisma.$queryRaw<{id: number}[]>(
        Prisma.sql`
            SELECT R.id
            FROM "Recipe" R
                     LEFT JOIN "Mark" M on R.id = M."recipeId"
            group by R.id
            order by avg(M.mark) desc
            LIMIT ${limit};
        `
    ).then((recipes) => recipes.map((recipe) => recipe.id));
}

export async function getRecipesWithAvg(recipes: Recipe[], prisma: PrismaClient) {
    return await Promise.all(recipes.map(async (recipe: Recipe) => {
        return await getRecipeWithAvg(recipe, prisma);
    }));
}

export async function getRecipeWithAvg(recipe: Recipe, prisma: PrismaClient) {
    const aggregate = (await prisma.mark.aggregate({
        where: {
            recipeId: recipe.id
        },
        _avg: {
            mark: true
        },
        _count: {
            mark: true
        },
    }))

    return {
        ...recipe,
        marksAvg: aggregate._avg.mark,
        marksCount: aggregate._count.mark,
    }
}

export async function getRecipeWithIsLiked(recipe: Recipe, prisma: PrismaClient, userId: number) {
    const isLiked = await prisma.like.findFirst({
        where: {
            recipeId: recipe.id,
            userId: userId,
        }
    })

    return {
        ...recipe,
        isLiked: !!isLiked,
    }
}

export async function getRecipesWithIsLiked(recipes: Recipe[], prisma: PrismaClient, userId: number) {
    return await Promise.all(recipes.map(async (recipe: Recipe) => {
        return await getRecipeWithIsLiked(recipe, prisma, userId);
    }));
}

export async function getCaloriesOfRecipe(title: string, ingredients: Ingredient[]) {
    const openai = new OpenAI();

    const systemMessage = {
        role: 'system',
        content: `Calcule approximativement le nombre de calories pour la recette "${title}" en utilisant les ingrédients suivants : ${ingredients.map(ingredient => `${ingredient.quantity} ${ingredient.name}`).join(', ')}. `+
            `Renvoie uniquement la valeur estimée des calories pour cette recette sous forme d'un nombre entier (format JSON que peut encoder un JSON.parse). `+
            `Assure-toi que la sortie est strictement le nombre estimé de calories, par exemple, 500, et exclut tout texte ou phrase supplémentaire.`
    };

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage as any],
    });

    return JSON.parse(completion.choices[0].message.content ?? "");
}

export const userSelect = {
    select: {
        id: true,
        firstName: true,
    }
}

export const userSelectProtected = {
    select: {
        id: true,
        firstName: true,
        email: true,
        role: true,
        preferences: true,
    }
}