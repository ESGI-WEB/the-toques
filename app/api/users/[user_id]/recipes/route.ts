import {isAuthenticated} from "@/app/libs/auth";
import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {getRecipesWithAvg, getRecipesWithIsLiked} from "@/prisma/utils";

export async function GET(request: Request) {
    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const prisma = new PrismaClient();

    let recipes = await prisma.recipe.findMany({
        where: {
            authorId: user.id,
        }
    });

    recipes = await getRecipesWithAvg(recipes, prisma);
    recipes = await getRecipesWithIsLiked(recipes, prisma, user.id);
    return NextResponse.json(recipes, {status: 200});
}