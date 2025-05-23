import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import InventoryPanel from "../components/InventoryPanel";
import RecipePanel from "../components/RecipePanel";
import RecipeSuggestionsModal from "../components/RecipeSuggestionsModal";
import AddItemModal from "../components/AddItemModal";
import UploadImageModal from "../components/UploadImageModal";
import Footer from "../components/Footer";
import { useNotification } from "../components/Notification";
import {
  getInventory,
  getRecipeHistory,
  suggestRecipes,
  createRecipe,
} from "../services/api";

// Maximum recipes per user
const MAX_RECIPES_PER_USER = 3;

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showUploadImageModal, setShowUploadImageModal] = useState(false);
  const [recipeSuggestions, setRecipeSuggestions] = useState([]);
  const [isSuggestingRecipes, setIsSuggestingRecipes] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [inventoryData, recipeData] = await Promise.all([
          getInventory(),
          getRecipeHistory(),
        ]);

        setInventory(inventoryData);
        // Ensure we only keep the latest MAX_RECIPES_PER_USER recipes
        setRecipes(recipeData.slice(0, MAX_RECIPES_PER_USER));
      } catch (error) {
        showNotification("Failed to load dashboard data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  // Refresh data function
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [inventoryData, recipeData] = await Promise.all([
        getInventory(),
        getRecipeHistory(),
      ]);

      setInventory(inventoryData);
      // Ensure we only keep the latest MAX_RECIPES_PER_USER recipes
      setRecipes(recipeData.slice(0, MAX_RECIPES_PER_USER));
      showNotification("Data refreshed successfully", "success");
    } catch (error) {
      showNotification("Failed to refresh data", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle inventory updates
  const handleInventoryChange = (updatedInventory) => {
    setInventory(updatedInventory);
  };

  // Handle recipe suggestions
  const handleSuggestRecipes = async () => {
    if (inventory.length === 0) {
      showNotification(
        "Your inventory is empty. Add some ingredients first!",
        "warning"
      );
      return;
    }

    setIsSuggestingRecipes(true);

    try {
      // Get ingredients from inventory
      const ingredients = inventory.map((item) => item.name);

      // Get recipe suggestions
      const suggestions = await suggestRecipes({
        custom_ingredients: ingredients,
        ignore_history: false,
      });

      if (suggestions.length === 0) {
        showNotification(
          "No recipe suggestions found. Try adding more ingredients.",
          "warning"
        );
      } else {
        setRecipeSuggestions(suggestions);
        setShowSuggestionsModal(true);
      }
    } catch (error) {
      showNotification("Failed to suggest recipes", "error");
    } finally {
      setIsSuggestingRecipes(false);
    }
  };

  // Handle recipe creation
  const handleCreateRecipe = async (recipeData) => {
    try {
      const newRecipe = await createRecipe(recipeData);

      // Close modal
      setShowSuggestionsModal(false);

      // Update recipe list (backend should already handle limiting to MAX_RECIPES_PER_USER)
      // Refresh the recipe data to get the updated list
      await refreshData();

      // Navigate to recipe detail
      navigate(`/recipe/${newRecipe.recipe_id}`);

      showNotification("Recipe added to your collection!", "success");
    } catch (error) {
      showNotification("Failed to create recipe", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Header />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />

      <main className="page-content">
        <div className="container">
          <h1 className="mb-6">Your Dashboard</h1>

          <div className="dashboard-layout">
            <div className="card inventory-panel">
              <InventoryPanel
                inventory={inventory}
                onInventoryChange={handleInventoryChange}
                onAddItem={() => setShowAddItemModal(true)}
                onUploadImage={() => setShowUploadImageModal(true)}
                onRefresh={refreshData}
                isRefreshing={isRefreshing}
              />
            </div>

            <div className="card recipe-panel">
              <RecipePanel
                recipes={recipes}
                onSuggestRecipes={handleSuggestRecipes}
                isSuggestingRecipes={isSuggestingRecipes}
                onRefresh={refreshData}
                isRefreshing={isRefreshing}
              />
            </div>
          </div>

          {inventory.length === 0 && recipes.length === 0 && (
            <div className="alert alert-info mt-6">
              <h4 className="mb-2">Getting Started with StockChef</h4>
              <p>
                Welcome to your dashboard! To get started, add ingredients to
                your inventory either manually or by uploading a photo. Once you
                have ingredients, you can get recipe suggestions based on what
                you have available.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {showSuggestionsModal && (
        <RecipeSuggestionsModal
          suggestions={recipeSuggestions}
          onClose={() => setShowSuggestionsModal(false)}
          onCreateRecipe={handleCreateRecipe}
        />
      )}

      {showAddItemModal && (
        <AddItemModal
          onClose={() => setShowAddItemModal(false)}
          onItemAdded={refreshData}
        />
      )}

      {showUploadImageModal && (
        <UploadImageModal
          onClose={() => setShowUploadImageModal(false)}
          onUploadSuccess={refreshData}
        />
      )}
    </div>
  );
};

export default Dashboard;
