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

    const systemMessage: IChatMessage = {
        role: 'system',
        content: `Étant donné la recette : "${recipe.title}" `+
            `avec comme ingrédients : "${recipe.ingredients.map(ingredient => ingredient.name).join(', ')}". `+
            `Genère un texte permettant de proposer des accompagnements liés à la recette, comme du vin, des desserts ou des fromages. `+
            `Pour les sauts de lignes utilise <br>, pour les listes utilise <ul> et <li> et <strong> pour le gras. Le texte doit maximum faire entre 50 et 200 caractères `+
            `Comme le ferait un sommelier, un pâtissier ou un fromager. Commence par "Avec cette recette, nous vous proposons...". `,
    };

    if (user) {
        const userDetails = await prisma.user.findUnique({
            where: {
                id: user.id,
            }
        });
        if (userDetails?.preferences) {
            systemMessage.content += "Voici les préférences alimentaires que l'utilisateur a renseigné sur le site : " + userDetails.preferences + ". Prends en compte ces préférences dans ta réponse."
        }
    }


    await prisma.$disconnect();

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage as any],
    });
    return new NextResponse(JSON.stringify({content: completion.choices[0].message.content}), {status: 200});
}