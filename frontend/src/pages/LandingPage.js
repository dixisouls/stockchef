import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">StockChef</div>
        <nav className="landing-nav">
          <Link to="/login" className="landing-nav-button">
            Log In
          </Link>
          <Link
            to="/register"
            className="landing-nav-button landing-nav-button-accent"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Turn Your Ingredients into Delicious Meals
          </h1>
          <p className="landing-hero-subtitle">
            StockChef uses AI to suggest personalized recipes based on what's
            already in your kitchen.
          </p>
          <div className="landing-hero-buttons">
            <Link
              to="/register"
              className="landing-button landing-button-primary"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="landing-button landing-button-secondary"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="landing-hero-image">
          <img
            src="/landing-hero.jpeg"
            alt="StockChef hero"
            className="hero-image"
          />
        </div>
      </section>

      <section id="features" className="landing-features">
        <h2 className="landing-section-title">How StockChef Works</h2>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">📷</div>
            <h3 className="landing-feature-title">Take a Photo</h3>
            <p className="landing-feature-description">
              Snap a quick picture of your fridge or pantry and let our AI
              identify your ingredients.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">👨‍🍳</div>
            <h3 className="landing-feature-title">Get Personalized Recipes</h3>
            <p className="landing-feature-description">
              Based on your dietary preferences and available ingredients, we'll
              suggest recipes you can make right now.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon">🍽️</div>
            <h3 className="landing-feature-title">Cook & Track</h3>
            <p className="landing-feature-description">
              Follow the recipe and let us update your inventory automatically
              when you're done.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <h2 className="landing-cta-title">Ready to Start Cooking?</h2>
        <p className="landing-cta-subtitle">
          Join StockChef today and never waste ingredients again.
        </p>
        <Link to="/register" className="landing-button landing-button-primary">
          Create Free Account
        </Link>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-logo">StockChef</div>
          <p className="landing-footer-copyright">
            © {new Date().getFullYear()} StockChef. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
