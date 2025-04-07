import React, { useState, useEffect, useRef } from "react";

// Maximum recipes per user
const MAX_RECIPES_PER_USER = 3;

const RecipeSuggestionsModal = ({ suggestions, onClose, onCreateRecipe }) => {
  // Track which recipe is expanded (if any)
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [recipeBeingCreated, setRecipeBeingCreated] = useState(null);
  // Add a ref to scroll into view when recipe is expanded
  const expandedRecipeRef = useRef(null);

  // Effect to scroll to expanded recipe details when recipe is expanded
  useEffect(() => {
    if (expandedRecipeIndex !== null && expandedRecipeRef.current) {
      // Scroll the expanded recipe's action buttons into view
      expandedRecipeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [expandedRecipeIndex]);

  const toggleRecipe = (index) => {
    if (expandedRecipeIndex === index) {
      // If clicking on already expanded recipe, collapse it
      setExpandedRecipeIndex(null);
    } else {
      // Otherwise, expand the clicked recipe and collapse any other
      setExpandedRecipeIndex(index);
    }
  };

  const handleCreateRecipe = async (recipe) => {
    setIsCreating(true);
    setRecipeBeingCreated(recipe);

    try {
      await onCreateRecipe(recipe);
    } catch (error) {
      console.error("Failed to create recipe:", error);
      setIsCreating(false);
      setRecipeBeingCreated(null);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: "800px", maxHeight: "85vh", overflow: "auto" }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Recipe Suggestions</h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isCreating}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="recipe-suggestions">
          {suggestions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍳</div>
              <h3 className="empty-state-title">No Recipe Suggestions</h3>
              <p className="empty-state-message">
                We couldn't find any recipes that match your inventory. Try
                adding more ingredients.
              </p>
              <button className="button button-primary" onClick={onClose}>
                OK
              </button>
            </div>
          ) : (
            <>
              <div className="recipe-info-note">
                <strong>Note:</strong> You can save up to {MAX_RECIPES_PER_USER}{" "}
                recipes in your collection. If you already have{" "}
                {MAX_RECIPES_PER_USER} recipes, the oldest one will be replaced
                when you save a new recipe.
              </div>

              <div
                className="recipe-suggestion-list"
                style={{ maxHeight: "none", overflow: "visible" }}
              >
                {suggestions.map((recipe, index) => (
                  <div
                    key={index}
                    className={`recipe-suggestion-card ${
                      expandedRecipeIndex === index ? "expanded" : ""
                    }`}
                  >
                    <div
                      className="recipe-suggestion-header"
                      onClick={() => toggleRecipe(index)}
                    >
                      <h3 className="recipe-suggestion-title">
                        {recipe.recipe_name}
                      </h3>
                      <p className="recipe-suggestion-description">
                        {recipe.description}
                      </p>
                      <div className="recipe-suggestion-meta">
                        <div className="recipe-suggestion-time">
                          <span>⏱️</span> {recipe.approx_time}
                        </div>
                        <div className="recipe-suggestion-ingredients">
                          <span>🥕</span> {recipe.ingredients.length}{" "}
                          ingredients
                        </div>
                      </div>
                    </div>

                    {expandedRecipeIndex === index && (
                      <div className="recipe-suggestion-details">
                        <h4 className="recipe-suggestion-section-title">
                          Ingredients
                        </h4>
                        <ul className="recipe-suggestion-ingredients-list">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>

                        <h4 className="recipe-suggestion-section-title">
                          Instructions
                        </h4>
                        <ol className="recipe-suggestion-steps">
                          {recipe.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>

                        <div
                          className="recipe-suggestion-actions"
                          ref={
                            expandedRecipeIndex === index
                              ? expandedRecipeRef
                              : null
                          }
                        >
                          <button
                            className="button button-secondary"
                            onClick={() => toggleRecipe(index)}
                          >
                            Collapse
                          </button>
                          <button
                            className="button button-primary"
                            onClick={() => handleCreateRecipe(recipe)}
                            disabled={isCreating}
                          >
                            {isCreating && recipeBeingCreated === recipe ? (
                              <>
                                <span className="spinner-sm mr-2"></span>
                                Saving...
                              </>
                            ) : (
                              "Save Recipe"
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  className="button button-secondary"
                  onClick={onClose}
                  disabled={isCreating}
                >
                  Cancel
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
