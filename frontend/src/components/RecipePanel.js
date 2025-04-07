import React from "react";
import { Link } from "react-router-dom";

// Maximum recipes to display per user
const MAX_RECIPES_PER_USER = 3;

const RecipePanel = ({
  recipes,
  onSuggestRecipes,
  isSuggestingRecipes,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <>
      <div className="panel-header">
        <h2>Recipe Collection</h2>
        <div className="panel-actions">
          <button
            className="button button-accent"
            onClick={onSuggestRecipes}
            disabled={isSuggestingRecipes}
          >
            <span className="button-icon">🍳</span>
            {isSuggestingRecipes ? "Finding Recipes..." : "Suggest Recipes"}
          </button>
          <button
            className="button button-ghost ml-2"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh recipes"
          >
            <span className="button-icon">{isRefreshing ? "⟳" : "⟳"}</span>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3 className="empty-state-title">No recipes yet</h3>
          <p className="empty-state-message">
            Get recipe suggestions based on what's in your inventory
          </p>
          <button
            className="button button-accent"
            onClick={onSuggestRecipes}
            disabled={isSuggestingRecipes}
          >
            <span className="button-icon">🍳</span>
            {isSuggestingRecipes
              ? "Finding Recipes..."
              : "Get Recipe Suggestions"}
          </button>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.slice(0, MAX_RECIPES_PER_USER).map((recipe) => (
            <RecipeCard key={recipe.recipe_id} recipe={recipe} />
          ))}
        </div>
      )}

      {recipes.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            You can have up to {MAX_RECIPES_PER_USER} recipes in your
            collection.
          </p>
        </div>
      )}
    </>
  );
};

const RecipeCard = ({ recipe }) => {
  // Format cooking time
  const formatTime = (minutes) => {
    if (!minutes) return "N/A";

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  // Generate emoji based on recipe name
  const getRecipeEmoji = (recipeName) => {
    const lowercaseName = recipeName.toLowerCase();

    if (lowercaseName.includes("pasta") || lowercaseName.includes("spaghetti"))
      return "🍝";
    if (lowercaseName.includes("pizza")) return "🍕";
    if (lowercaseName.includes("burger")) return "🍔";
    if (lowercaseName.includes("taco") || lowercaseName.includes("mexican"))
      return "🌮";
    if (lowercaseName.includes("soup")) return "🍲";
    if (lowercaseName.includes("salad")) return "🥗";
    if (lowercaseName.includes("cake") || lowercaseName.includes("dessert"))
      return "🍰";
    if (lowercaseName.includes("chicken")) return "🍗";
    if (lowercaseName.includes("fish") || lowercaseName.includes("seafood"))
      return "🐟";
    if (lowercaseName.includes("curry")) return "🍛";
    if (lowercaseName.includes("breakfast")) return "🍳";
    if (lowercaseName.includes("rice")) return "🍚";
    if (lowercaseName.includes("sandwich")) return "🥪";
    if (lowercaseName.includes("bread")) return "🍞";

    // Default emoji
    return "🍽️";
  };

  return (
    <div className="recipe-card">
      <div className="recipe-card-image">
        <div className="recipe-card-image-placeholder">
          {getRecipeEmoji(recipe.title)}
        </div>
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="recipe-card-description">
          {recipe.short_description || "No description available."}
        </p>
        <div className="recipe-card-footer">
          <div className="recipe-card-stats">
            <div className="recipe-card-time">
              ⏱️ {formatTime(recipe.total_time_minutes)}
            </div>
          </div>
          <Link
            to={`/recipe/${recipe.recipe_id}`}
            className="button button-primary button-small"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipePanel;
