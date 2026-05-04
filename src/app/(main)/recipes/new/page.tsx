import { getAuthenticatedUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import RecipeForm from "@/components/recipes/RecipeForm";
import type { RecipeFormData } from "@/components/recipes/RecipeForm";

export default async function NewRecipePage() {
  const { error } = await getAuthenticatedUser();
  if (error) redirect("/signin");

  const initial: RecipeFormData = {
    title: "",
    description: "",
    imageUrl: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: [],
    steps: [],
  };

  return <RecipeForm initial={initial} mode="create" />;
}
