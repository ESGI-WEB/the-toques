import {NextResponse} from "next/server";
import {isAuthenticated} from "@/app/libs/auth";
import {Prisma, PrismaClient} from "@prisma/client";
import {createRecipeSchema} from "@/app/libs/recipes/validators";
import {getCaloriesOfRecipe, getRecipesWithAvg, getRecipesWithIsLiked} from "@/prisma/utils";
import {uploadToDropbox} from "@/app/libs/utils";

export async function POST(request: Request) {
    const user = await isAuthenticated(request);
    if (!user) {
        return NextResponse.json({}, {status: 401});
    }

    const {value, error} = createRecipeSchema.validate(await request.json());
    if (error) {
        return NextResponse.json({error: error.details}, {status: 422});
    }

    const prisma = new PrismaClient();

    try {
        const {title, steps, ingredients, image} = value;

        const imageBase64 = image.split(",")[1];
        const imageBuffer = Buffer.from(imageBase64, "base64");
        const imageName = `${Date.now()}-${Math.random() * 10000}.png`;
        const url = await uploadToDropbox(imageBuffer, imageName);

        const recipe = await prisma.recipe.create({
            data: {
                title,
                authorId: user.id,
                ingredients: {
                    create: ingredients,
                },
                steps: {
                    create: steps,
                },
                image: url,
            },
            include: {
                ingredients: true,
                steps: true,
            }
        });

        // try to get calories from recipe 3 time asynchronously, or fill with 500 default value
        fillInRecipeCalories(recipe);

        await prisma.$disconnect();
        return NextResponse.json(recipe, {status: 200});
    } catch (error) {
        await prisma.$disconnect();
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({error: error.message}, {status: 422});
        }
        console.error(error);
        return NextResponse.json({}, {status: 500});
    }
}

const fillInRecipeCalories = async (recipe: any, times = 0) => {
    setTimeout(async () => {
        const prisma = new PrismaClient();
        let calories = null;

        try {
            calories = await getCaloriesOfRecipe(recipe.title, recipe.ingredients);
        } catch (e) {

        }

        if (!isFinite(calories)) {
            if (times < 3) {
                await prisma.$disconnect();
                return fillInRecipeCalories(recipe, times + 1);
            } else {
                calories = 500; // default to 500 calories
            }
        }

        await prisma.recipe.update({
            where: {
                id: recipe.id,
            },
            data: {
                calories,
            }
        });
        await prisma.$disconnect();
    }, 2000);
}

export async function GET(request: Request) {
    const prisma = new PrismaClient();

    let findManyArgs = {}
    if (request.url.includes('calories=')) {
        const order = request.url.includes('calories=asc') ? 'asc' : 'desc';
        findManyArgs = {
            orderBy: {
                calories: order,
            }
        }
    }

    let recipes = await prisma.recipe.findMany(findManyArgs);

    recipes = await getRecipesWithAvg(recipes, prisma);

    const user = await isAuthenticated(request);
    if (user) {
        recipes = await getRecipesWithIsLiked(recipes, prisma, user.id)
    }

    await prisma.$disconnect();
    return NextResponse.json(recipes, {status: 200});
}