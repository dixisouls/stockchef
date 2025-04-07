import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import { getPreferences, updatePreferences } from "../services/api";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    dietary_preference_id: "",
    cuisine_preference_id: "",
  });

  const [preferences, setPreferences] = useState({
    dietary_preferences: [],
    cuisines: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load available preferences and current user preferences
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const preferencesData = await getPreferences();
        setPreferences(preferencesData);

        // Set current user preferences
        if (user) {
          const currentDietaryPref =
            user.dietary_preferences[0]?.preference_id || "";
          const currentCuisinePref =
            user.preferred_cuisines[0]?.cuisine_id || "";

          setFormData({
            dietary_preference_id: currentDietaryPref,
            cuisine_preference_id: currentCuisinePref,
          });
        }
      } catch (error) {
        showNotification("Failed to load preferences", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      // Convert IDs to numbers
      const updatedPreferences = {
        dietary_preference_id: Number(formData.dietary_preference_id),
        cuisine_preference_id: Number(formData.cuisine_preference_id),
      };

      await updatePreferences(updatedPreferences);

      // Refresh user data to get updated preferences
      await refreshUser();

      showNotification("Preferences updated successfully", "success");
    } catch (error) {
      showNotification("Failed to update preferences", "error");
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="page-container">
      <Header />

      <main className="page-content">
        <div className="container profile-container">
          <div className="card">
            <div className="profile-header">
              <h1 className="profile-title">Profile Settings</h1>
              <p className="profile-subtitle">
                Manage your personal information and preferences
              </p>
            </div>

            {user && (
              <>
                <div className="profile-section">
                  <h2 className="profile-section-title">Account Information</h2>
                  <div className="profile-info-item">
                    <div className="profile-info-label">Name:</div>
                    <div className="profile-info-value">
                      {user.first_name} {user.last_name}
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-label">Email:</div>
                    <div className="profile-info-value">{user.email}</div>
                  </div>
                  <div className="profile-info-item">
                    <div className="profile-info-label">Account Created:</div>
                    <div className="profile-info-value">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h2 className="profile-section-title">Preferences</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="dietary_preference_id"
                      >
                        Dietary Preference
                      </label>
                      <select
                        id="dietary_preference_id"
                        name="dietary_preference_id"
                        className="form-select"
                        value={formData.dietary_preference_id}
                        onChange={handleChange}
                        disabled={isSaving}
                      >
                        <option value="">Select a dietary preference</option>
                        {preferences.dietary_preferences.map((pref) => (
                          <option
                            key={pref.preference_id}
                            value={pref.preference_id}
                          >
                            {pref.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        This helps us suggest recipes that match your dietary
                        needs
                      </p>
                    </div>

                    <div className="form-group">
                      <label
                        className="form-label"
                        htmlFor="cuisine_preference_id"
                      >
                        Cuisine Preference
                      </label>
                      <select
                        id="cuisine_preference_id"
                        name="cuisine_preference_id"
                        className="form-select"
                        value={formData.cuisine_preference_id}
                        onChange={handleChange}
                        disabled={isSaving}
                      >
                        <option value="">Select a cuisine preference</option>
                        {preferences.cuisines.map((cuisine) => (
                          <option
                            key={cuisine.cuisine_id}
                            value={cuisine.cuisine_id}
                          >
                            {cuisine.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        We'll prioritize recipes from your preferred cuisine
                      </p>
                    </div>

                    <div className="profile-actions">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => navigate("/dashboard")}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="button button-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span className="spinner-sm mr-2"></span>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
