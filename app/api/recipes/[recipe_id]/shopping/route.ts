import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {IChatMessage} from "@/app/resources/models/message";
import OpenAI from "openai";
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

    const systemMessage: IChatMessage = {
        role: 'system',
        content: `Étant donné la recette : "${recipe.title}" `+
            `avec comme ingrédients : "${recipe.ingredients.map(ingredient => (ingredient.quantity + " " + ingredient.name)).join(', ')}". `+
            `Genère une liste de courses permettant de faire cette recette. `+
            `Pour les sauts de lignes utilise <br>, pour les listes utilise <ul> et <li> et <strong> pour le gras.`,
    };

    await prisma.$disconnect();

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage as any],
    });
    return new NextResponse(JSON.stringify({content: completion.choices[0].message.content}), {status: 200});
}