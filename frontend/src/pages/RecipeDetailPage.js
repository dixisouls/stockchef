import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getRecipeDetail, cookRecipe } from "../services/api";
import { useNotification } from "../components/Notification";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCooking, setIsCooking] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const recipeData = await getRecipeDetail(id);
        setRecipe(recipeData);
      } catch (error) {
        showNotification("Failed to load recipe", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, showNotification]);

  const handleCookRecipe = async () => {
    setIsCooking(true);

    try {
      const result = await cookRecipe(id);
      showNotification(result.message, "success");
      navigate("/dashboard");
    } catch (error) {
      showNotification("Failed to cook recipe", "error");
      setIsCooking(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="loading-spinner">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div>
        <Header />
        <div className="container">
          <div className="error-message">
            Recipe not found.{" "}
            <button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format instructions for display
  const instructions = recipe.instructions
    .split("\n")
    .filter((line) => line.trim());

  return (
    <div>
      <Header />

      <div className="container recipe-detail">
        <div className="recipe-header">
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <h1 className="recipe-title">{recipe.title}</h1>

          {recipe.short_description && (
            <p className="recipe-description">{recipe.short_description}</p>
          )}

          <div className="recipe-meta">
            <div className="recipe-meta-item">
              <span className="recipe-meta-icon">⏱️</span>
              <span className="recipe-meta-text">
                {recipe.total_time_minutes
                  ? `${recipe.total_time_minutes} minutes`
                  : "Time not specified"}
              </span>
            </div>
          </div>
        </div>

        <div className="recipe-content">
          <div className="recipe-section">
            <h2 className="recipe-section-title">Ingredients</h2>
            <ul className="recipe-ingredients">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="recipe-ingredient-item">
                  {ingredient.ingredient_name}
                </li>
              ))}
            </ul>
          </div>

          <div className="recipe-section">
            <h2 className="recipe-section-title">Instructions</h2>
            <ol className="recipe-steps">
              {instructions.map((step, index) => (
                <li key={index} className="recipe-step-item">
                  <div className="recipe-step-number">{index + 1}</div>
                  <div className="recipe-step-content">{step}</div>
                </li>
              ))}
            </ol>
          </div>

          <div className="recipe-action">
            <button
              className="button button-accent"
              onClick={handleCookRecipe}
              disabled={isCooking}
            >
              {isCooking ? "Updating Inventory..." : "I Made This! 🍳"}
            </button>
            <p className="recipe-action-hint">
              Clicking this button will remove used ingredients from your
              inventory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
