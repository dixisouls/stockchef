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
  const [preferences, setPreferences] = useState({
    dietary_preferences: [],
    cuisines: [],
  });

  const navigate = useNavigate();
  const { register } = useAuth();
  const { showNotification } = useNotification();

  // Fetch available preferences
  useEffect(() => {
    const fetchPreferences = async () => {
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>

        <form onSubmit={handleSubmit}>
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
            />
            {errors.password && (
              <div className="form-error">{errors.password}</div>
            )}
          </div>

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
            />
            {errors.last_name && (
              <div className="form-error">{errors.last_name}</div>
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
            className="button button-accent"
            style={{ width: "100%" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <Link to="/login" className="auth-link">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
