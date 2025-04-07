import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import { getPreferences } from "../services/api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    dietary_preference_id: "",
    cuisine_preference_id: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    dietary_preferences: [],
    cuisines: [],
  });

  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Fetch available preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const data = await getPreferences();
        setPreferences(data);

        // Set default selections if available
        if (data.dietary_preferences.length > 0) {
          setFormData((prev) => ({
            ...prev,
            dietary_preference_id: data.dietary_preferences[0].preference_id,
          }));
        }

        if (data.cuisines.length > 0) {
          setFormData((prev) => ({
            ...prev,
            cuisine_preference_id: data.cuisines[0].cuisine_id,
          }));
        }
      } catch (error) {
        showNotification("Failed to load preferences", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.first_name) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.dietary_preference_id) {
      newErrors.dietary_preference_id = "Dietary preference is required";
    }

    if (!formData.cuisine_preference_id) {
      newErrors.cuisine_preference_id = "Cuisine preference is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert preference IDs to numbers
      const userData = {
        ...formData,
        dietary_preference_id: Number(formData.dietary_preference_id),
        cuisine_preference_id: Number(formData.cuisine_preference_id),
      };

      await register(userData);
      showNotification("Registration successful!", "success");
      navigate("/dashboard");
    } catch (error) {
      showNotification(error.message || "Registration failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
              fill="currentColor"
            />
          </svg>
          StockChef
        </div>

        <h2 className="auth-title">Create an Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="form-input"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="First Name"
              />
              {errors.first_name && (
                <div className="form-error">{errors.first_name}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="last_name">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="form-input"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="Last Name"
              />
              {errors.last_name && (
                <div className="form-error">{errors.last_name}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="your@email.com"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="••••••••"
            />
            {errors.password && (
              <div className="form-error">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dietary_preference_id">
              Dietary Preference
            </label>
            <select
              id="dietary_preference_id"
              name="dietary_preference_id"
              className="form-select"
              value={formData.dietary_preference_id}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Select a dietary preference</option>
              {preferences.dietary_preferences.map((pref) => (
                <option key={pref.preference_id} value={pref.preference_id}>
                  {pref.name}
                </option>
              ))}
            </select>
            {errors.dietary_preference_id && (
              <div className="form-error">{errors.dietary_preference_id}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cuisine_preference_id">
              Cuisine Preference
            </label>
            <select
              id="cuisine_preference_id"
              name="cuisine_preference_id"
              className="form-select"
              value={formData.cuisine_preference_id}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Select a cuisine preference</option>
              {preferences.cuisines.map((cuisine) => (
                <option key={cuisine.cuisine_id} value={cuisine.cuisine_id}>
                  {cuisine.name}
                </option>
              ))}
            </select>
            {errors.cuisine_preference_id && (
              <div className="form-error">{errors.cuisine_preference_id}</div>
            )}
          </div>

          <button
            type="submit"
            className="button button-primary w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm mr-2"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <Link to="/login" className="auth-link mt-4">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
