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
    <div className="card">
      <div className="panel-header">
        <h2 className="panel-title">
          Recipe History (Latest {MAX_RECIPES_PER_USER})
        </h2>
        <div className="panel-actions">
          <button
            className="button button-accent"
            onClick={onSuggestRecipes}
            disabled={isSuggestingRecipes}
          >
            {isSuggestingRecipes ? "Finding Recipes..." : "Suggest Recipes"}
          </button>
          <button
            className="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh recipes"
            style={{ marginLeft: "10px" }}
          >
            {isRefreshing ? "⟳ Refreshing..." : "⟳"}
          </button>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <p>
            You haven't cooked any recipes yet. Get recipe suggestions based on
            your inventory!
          </p>
          <button
            className="button button-accent"
            onClick={onSuggestRecipes}
            disabled={isSuggestingRecipes}
          >
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
    </div>
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

  return (
    <div className="recipe-card">
      <div className="recipe-card-image"></div>
      <div className="recipe-card-content">
        <div className="recipe-card-header">
          <h3 className="recipe-card-title">{recipe.title}</h3>
        </div>
        <p className="recipe-card-description">
          {recipe.short_description || "No description available."}
        </p>
        <div className="recipe-card-footer">
          <div className="recipe-time">
            ⏱️ {formatTime(recipe.total_time_minutes)}
          </div>
          <Link to={`/recipe/${recipe.recipe_id}`} className="button">
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipePanel;
