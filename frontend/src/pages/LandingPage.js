import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="landing-container">
      <Header />

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
          <div className="auth-buttons mt-4">
            <Link to="/login" className="button button-secondary mr-2">
              Log In
            </Link>
            <Link to="/register" className="button button-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features">
        <h2 className="landing-section-title">How StockChef Works</h2>
        <p className="landing-section-subtitle">
          Our AI-powered platform makes it easy to reduce food waste and create
          delicious meals with what you already have.
        </p>

        <div className="landing-features-grid container">
          <div className="landing-feature-card">
            <div className="landing-feature-icon">📷</div>
            <h3 className="landing-feature-title">Take a Photo</h3>
            <p className="landing-feature-description">
              Snap a quick picture of your fridge or pantry and let our AI
              identify your ingredients automatically.
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
              when you're done cooking.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Ready to Start Cooking?</h2>
          <p className="landing-cta-subtitle">
            Join StockChef today and never waste ingredients again. Our smart
            recipe generator helps you make the most of what you have.
          </p>
          <Link to="/register" className="button button-primary button-large">
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-logo">StockChef</div>

          <div className="landing-footer-links">
            <a href="#features" className="landing-footer-link">
              Features
            </a>
          </div>

          <div className="landing-footer-divider"></div>

          <div className="landing-footer-bottom">
            <p className="landing-footer-attribution">
              Created by{" "}
              <a
                href="https://divyapanchal.com/"
                className="landing-footer-attribution-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Divya Panchal
              </a>{" "}
              |
              <a
                href="https://github.com/dixisouls/stockchef"
                className="landing-footer-attribution-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                GitHub
              </a>
            </p>

            <p className="landing-footer-copyright">
              © {new Date().getFullYear()} StockChef. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
