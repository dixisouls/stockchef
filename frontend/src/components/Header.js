import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll position to apply scrolled styles
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Determine if this is on the landing page
  const isLandingPage = location.pathname === "/";

  return (
    <header
      className={`header ${scrolled ? "header-scrolled" : ""} ${
        isLandingPage ? "landing-header" : ""
      }`}
    >
      <div className="header-container">
        <Link to="/" className="header-logo">
          <svg
            width="24"
            height="24"
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
        </Link>

        <div className="header-nav">
          {user ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button className="user-dropdown-button" onClick={toggleDropdown}>
                <span className="user-name">
                  {user.first_name} {user.last_name}
                </span>
                <span className="user-avatar">
                  {user.first_name.charAt(0)}
                  {user.last_name.charAt(0)}
                </span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="dropdown-icon">📊</i> Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="dropdown-icon">👤</i> Profile Settings
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="dropdown-icon">🚪</i> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header-auth-buttons">
              {!isLandingPage && (
                <>
                  <Link to="/login" className="button button-ghost">
                    Log In
                  </Link>
                  <Link to="/register" className="button button-primary ml-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
