import {PrismaClient, Recipe} from '@prisma/client';
import {isAuthenticated} from "@/app/libs/auth";

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
    }
}