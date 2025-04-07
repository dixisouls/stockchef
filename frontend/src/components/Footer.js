import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content container">
        <div className="footer-logo">StockChef</div>

        <div className="footer-links">
          <Link to="/dashboard" className="footer-link">
            Dashboard
          </Link>
          <Link to="/profile" className="footer-link">
            Profile
          </Link>
        </div>

        <p className="footer-attribution">
          Created by{" "}
          <a
            href="https://divyapanchal.com/"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Divya Panchal
          </a>{" "}
          |
          <a
            href="https://github.com/dixisouls/stockchef"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            GitHub
          </a>
        </p>

        <p className="footer-copyright">
          © {new Date().getFullYear()} StockChef. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
