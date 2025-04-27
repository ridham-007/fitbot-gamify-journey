
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-fitDark-900 border-t border-gray-200 dark:border-fitDark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-bold text-fitPurple-600">
              BubblyFit AI
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              AI-powered fitness with gamification for a more engaging workout experience.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  About
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 dark:border-fitDark-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} FitBot. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-xs text-gray-500 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-gray-500 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
              Terms
            </Link>
            <Link to="/cookies" className="text-xs text-gray-500 dark:text-gray-400 hover:text-fitPurple-600 dark:hover:text-fitPurple-400">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
