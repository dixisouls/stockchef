import React from "react";
import { Link } from "react-router-dom";
import { useNotification } from "./Notification";

const RecipePanel = ({
  recipes,
  onSuggestRecipes,
  isSuggestingRecipes,
  onRefresh,
  isRefreshing,
  onRemoveRecipe,
}) => {
  return (
    <div className="card">
      <div className="panel-header">
        <h2 className="panel-title">Recipe History</h2>
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
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.recipe_id}
              recipe={recipe}
              onRemove={onRemoveRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RecipeCard = ({ recipe, onRemove }) => {
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

  const handleRemove = (e) => {
    e.preventDefault(); // Prevent navigating to recipe detail
    e.stopPropagation(); // Prevent event bubbling

    if (onRemove) {
      // Just call onRemove without showing notification here
      onRemove(recipe.recipe_id);
      // Removed success notification to avoid showing it before API call completes
    }
  };

  return (
    <div className="recipe-card">
      <div className="recipe-card-image"></div>
      <div className="recipe-card-content">
        <div className="recipe-card-header">
          <h3 className="recipe-card-title">{recipe.title}</h3>
          <button
            className="recipe-remove-button"
            onClick={handleRemove}
            title="Remove from history"
          >
            &#8722;
          </button>
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
