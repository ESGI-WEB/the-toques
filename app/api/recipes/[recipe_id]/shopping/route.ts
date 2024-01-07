import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {IChatMessage} from "@/app/resources/models/message";
import OpenAI from "openai";

export async function POST(request: Request, {params}: { params: { recipe_id: string } }) {
    const prisma = new PrismaClient();
    const recipeId = Number(params.recipe_id);

    const { numberPlates } = await request.json();

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: recipeId,
        },
        include: {
            ingredients: true,
        }
    });

    if (!recipe) {
        await prisma.$disconnect();
        return new NextResponse(null, {status: 404});
    }

    const systemMessage: IChatMessage = {
        role: 'system',
        content: `En tenant compte de la recette "${recipe.title}" qui nécessite les ingrédients suivants : ` +
            `"${recipe.ingredients.map(ingredient => `${ingredient.quantity} ${ingredient.name}`).join(', ')}", ` +
            `et qui est prévue pour ${recipe.plates} portions, génère une liste de courses des ingrédients à acheter adaptée pour ${numberPlates} portions en faisant un simple produit en croix. ` +
            `Fait le calcul suivant ${numberPlates} x quantité de l'ingrédient / ${recipe.plates}. Si ${numberPlates} == ${recipe.plates} alors renvoi juste la quantité de base.` +
            `Assure-toi que la sortie est strictement la liste de courses, et exclut tout texte ou phrase supplémentaire. `+
            `Pour les sauts de lignes, utilise &lt;br&gt;, pour les listes, utilise &lt;ul&gt; et &lt;li&gt;, et &lt;strong&gt; pour le gras.`
    };

    await prisma.$disconnect();

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage as any],
    });

    return new NextResponse(JSON.stringify({content: completion.choices[0].message.content}), {status: 200});
}