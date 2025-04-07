import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/"); // Changed from "/login" to "/"
  };

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

  return (
    <header className="dashboard-header">
      <Link to="/" className="dashboard-logo">
        StockChef
      </Link>

      <div className="dashboard-nav">
        {user && (
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
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile Settings
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
