"use client";

import { useState } from "react";
import { ChefHat } from "lucide-react";
import { RecipeCard, RecipeFAB, type Recipe } from "@/components/recipes/RecipeCard";
import AddToListSheet from "@/components/search/AddToListSheet";

export default function RecipesClient({
  initialRecipes,
  currentUserId,
}: {
  initialRecipes: Recipe[];
  currentUserId: string;
}) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [activeTab, setActiveTab] = useState<"recipes" | "ai-chef">("recipes");
  const [addToListRecipe, setAddToListRecipe] = useState<Recipe | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1416] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-4 pb-2 flex-shrink-0">
        <span className="text-[16px] font-medium text-[#111] dark:text-[#e0e0e0]">
          Recipes
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#ebebeb] dark:border-[#2e3538] px-4 gap-6 flex-shrink-0">
        {(["recipes", "ai-chef"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "text-[13px] font-medium pb-2.5 border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "text-[#00b89e] border-[#00E5C3]"
                : "text-[#bbb] border-transparent",
            ].join(" ")}
          >
            {tab === "recipes" ? "Recipes" : "AI Chef"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {activeTab === "recipes" ? (
          <div className="pt-3">
            {recipes.length === 0 ? (
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="w-14 h-14 rounded-[18px] bg-[#f0fdf9] dark:bg-[#1a2e2a] flex items-center justify-center mb-4">
                  <ChefHat size={24} className="text-[#00b89e]" strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0] mb-2">
                  No recipes yet
                </p>
                <p className="text-[13px] text-[#aaa] leading-relaxed mb-6">
                  Create your first recipe and add all its ingredients to a list in one tap.
                </p>
                <button
                  onClick={() => {
                    window.location.href = "/recipes/new";
                  }}
                  className="px-5 py-2.5 bg-[#00E5C3] rounded-xl text-[13px] font-medium text-[#004d40]"
                >
                  Create recipe
                </button>
              </div>
            ) : (
              recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  currentUserId={currentUserId}
                  onAddToList={(r) => setAddToListRecipe(r)}
                  onDeleted={(id) =>
                    setRecipes((prev) => prev.filter((r) => r.id !== id))
                  }
                />
              ))
            )}
          </div>
        ) : (
          /* AI Chef tab — coming soon */
          <div className="flex flex-col items-center py-16 px-8 text-center">
            <div className="w-14 h-14 rounded-[18px] bg-[#f0fdf9] dark:bg-[#1a2e2a] flex items-center justify-center mb-4">
              <ChefHat size={24} className="text-[#00b89e]" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0] mb-2">
              AI Chef coming soon
            </p>
            <p className="text-[13px] text-[#aaa] leading-relaxed">
              Get personalized recipe suggestions based on what&apos;s in your pantry and the best deals at your stores.
            </p>
          </div>
        )}
      </div>

      <RecipeFAB />

      {addToListRecipe && (
        <AddToListSheet
          mode="recipe"
          ingredients={addToListRecipe.ingredients}
          onClose={() => setAddToListRecipe(null)}
        />
      )}
    </div>
  );
}
