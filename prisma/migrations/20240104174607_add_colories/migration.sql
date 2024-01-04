-- AlterSequence
ALTER SEQUENCE "RecipeStep_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "calories" INT4;
