import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getRecipeDetail, cookRecipe } from "../services/api";
import { useNotification } from "../components/Notification";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCooking, setIsCooking] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const recipeData = await getRecipeDetail(id);
        setRecipe(recipeData);

        // Initialize all ingredients as unchecked
        const initialCheckedState = {};
        recipeData.ingredients.forEach((ing) => {
          initialCheckedState[ing.ingredient_name] = false;
        });
        setCheckedIngredients(initialCheckedState);
      } catch (error) {
        showNotification("Failed to load recipe", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, showNotification]);

  const toggleIngredient = (ingredientName) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [ingredientName]: !prev[ingredientName],
    }));
  };

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

  // Format cooking time
  const formatTime = (minutes) => {
    if (!minutes) return "Not specified";

    if (minutes < 60) {
      return `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minute${
      remainingMinutes > 1 ? "s" : ""
    }`;
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Header />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="page-container">
        <Header />
        <div className="container py-6">
          <div className="card text-center py-8">
            <div className="empty-state-icon">🍽️</div>
            <h2 className="empty-state-title">Recipe Not Found</h2>
            <p className="empty-state-message">
              We couldn't find the recipe you're looking for.
            </p>
            <button
              className="button button-primary mt-4"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Format instructions for display
  const instructions = recipe.instructions
    .split("\n")
    .filter((line) => line.trim());

  return (
    <div className="page-container">
      <Header />

      <main className="page-content">
        <div className="container recipe-detail-container">
          <div className="recipe-detail-header">
            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            <h1 className="recipe-detail-title">{recipe.title}</h1>

            {recipe.short_description && (
              <p className="recipe-detail-description">
                {recipe.short_description}
              </p>
            )}

            <div className="recipe-detail-meta">
              <div className="recipe-detail-meta-item">
                <span className="text-2xl">⏱️</span>
                <span>{formatTime(recipe.total_time_minutes)}</span>
              </div>
              <div className="recipe-detail-meta-item">
                <span className="text-2xl">🥣</span>
                <span>{recipe.ingredients.length} ingredients</span>
              </div>
            </div>
          </div>

          <div className="recipe-detail-content">
            <div className="recipe-detail-section">
              <h2 className="recipe-detail-section-title">Ingredients</h2>
              <ul className="recipe-ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="recipe-ingredient-item"
                    style={{
                      textDecoration: checkedIngredients[
                        ingredient.ingredient_name
                      ]
                        ? "line-through"
                        : "none",
                      opacity: checkedIngredients[ingredient.ingredient_name]
                        ? 0.6
                        : 1,
                    }}
                  >
                    <div
                      className={`ingredient-check ${
                        checkedIngredients[ingredient.ingredient_name]
                          ? "checked"
                          : ""
                      }`}
                      onClick={() =>
                        toggleIngredient(ingredient.ingredient_name)
                      }
                    ></div>
                    {ingredient.ingredient_name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="recipe-detail-section">
              <h2 className="recipe-detail-section-title">Instructions</h2>
              <ol className="recipe-steps-list">
                {instructions.map((step, index) => (
                  <li key={index} className="recipe-step-item">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="recipe-action">
            <button
              className="button button-accent button-large"
              onClick={handleCookRecipe}
              disabled={isCooking}
            >
              {isCooking ? (
                <>
                  <span className="spinner-sm mr-2"></span>
                  Updating Inventory...
                </>
              ) : (
                "I Made This! 🍳"
              )}
            </button>
            <p className="recipe-action-hint">
              Clicking this button will remove used ingredients from your
              inventory.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecipeDetailPage;
