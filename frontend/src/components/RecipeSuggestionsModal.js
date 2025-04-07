import React, { useState } from "react";

const RecipeSuggestionsModal = ({ suggestions, onClose, onCreateRecipe }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCreateRecipe = async () => {
    if (!selectedRecipe) return;

    setIsCreating(true);

    try {
      await onCreateRecipe(selectedRecipe);
    } catch (error) {
      console.error("Failed to create recipe:", error);
      setIsCreating(false);
    }
  };

  // Format time string to extract minutes
  const extractTimeMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 30; // Default to 30 minutes if parsing fails
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "800px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Recipe Suggestions</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="recipe-suggestions">
          {suggestions.length === 0 ? (
            <p>
              No recipe suggestions found. Try adding more ingredients to your
              inventory.
            </p>
          ) : (
            <>
              <p className="mb-2">
                We found {suggestions.length} recipes you can make with your
                ingredients:
              </p>

              <div className="recipe-suggestion-list">
                {suggestions.map((recipe, index) => (
                  <div
                    key={index}
                    className={`recipe-suggestion-card ${
                      selectedRecipe === recipe ? "selected" : ""
                    }`}
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <h3 className="recipe-suggestion-title">
                      {recipe.recipe_name}
                    </h3>
                    <p className="recipe-suggestion-description">
                      {recipe.description}
                    </p>
                    <div className="recipe-suggestion-meta">
                      <span className="recipe-suggestion-time">
                        ⏱️ {recipe.approx_time}
                      </span>
                      <span className="recipe-suggestion-ingredients">
                        🥕 {recipe.ingredients.length} ingredients
                      </span>
                    </div>

                    {selectedRecipe === recipe && (
                      <div className="recipe-suggestion-details">
                        <h4>Ingredients</h4>
                        <ul className="recipe-suggestion-ingredients-list">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>

                        <h4>Instructions</h4>
                        <ol className="recipe-suggestion-steps">
                          {recipe.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="recipe-suggestion-actions">
                <button
                  className="button"
                  onClick={onClose}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  className="button button-accent"
                  onClick={handleCreateRecipe}
                  disabled={!selectedRecipe || isCreating}
                  style={{ marginLeft: "10px" }}
                >
                  {isCreating ? "Saving..." : "Save Recipe"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestionsModal;
