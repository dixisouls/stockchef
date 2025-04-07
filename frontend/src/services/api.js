// API base URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Helper for making authenticated requests
const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    // Handle common error cases
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Something went wrong");
  }

  return response.json();
};

// Authentication APIs
export const loginUser = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  return response.json();
};

export const registerUser = async (userData) => {
  return fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  }).then((response) => {
    if (!response.ok) {
      return response.json().then((data) => {
        throw new Error(data.detail || "Registration failed");
      });
    }
    return response.json();
  });
};

// User APIs
export const getCurrentUser = async () => {
  return authFetch("/users/me");
};

export const getPreferences = async () => {
  return authFetch("/users/preferences");
};

export const updatePreferences = async (preferences) => {
  return authFetch("/users/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
};

// Inventory APIs
export const getInventory = async () => {
  return authFetch("/inventory/");
};

export const addInventoryItem = async (item) => {
  return authFetch("/inventory/item", {
    method: "POST",
    body: JSON.stringify(item),
  });
};

export const removeInventoryItem = async (itemId) => {
  return authFetch(`/inventory/item/${itemId}`, {
    method: "DELETE",
  });
};

export const uploadInventoryImage = async (imageFile) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${API_URL}/inventory/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to process image");
  }

  return response.json();
};

export const updateMultipleItems = async (items) => {
  return authFetch("/inventory/update-multiple", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
};

// Recipe APIs
export const getRecipeHistory = async () => {
  return authFetch("/recipes/history");
};

export const getRecipeDetail = async (recipeId) => {
  return authFetch(`/recipes/${recipeId}`);
};

export const suggestRecipes = async (options = {}) => {
  return authFetch("/recipes/suggest", {
    method: "POST",
    body: JSON.stringify(options),
  });
};

export const createRecipe = async (recipeData) => {
  return authFetch("/recipes/create", {
    method: "POST",
    body: JSON.stringify(recipeData),
  });
};

export const cookRecipe = async (recipeId) => {
  return authFetch(`/recipes/${recipeId}/cook`, {
    method: "POST",
  });
};
