# StockChef Frontend

StockChef is a smart recipe generator that helps you create meals based on
what's already in your kitchen. This is the frontend React application that
connects to the StockChef backend API.

## Features

- User authentication (login and registration)
- User profile management with dietary and cuisine preferences
- Inventory management with manual and image-based item addition
- Recipe suggestions based on available inventory
- Recipe viewing and cooking
- Automatic inventory updates when recipes are cooked

## Tech Stack

- React.js
- React Router for navigation
- Context API for state management
- CSS for styling (no external UI libraries)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- StockChef backend API running (see backend repository)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dixisouls/stockchef-frontend.git
   cd stockchef-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with the backend API URL:

   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The application will be available at
[http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/          # React Context for state management
├── pages/            # Page components
├── services/         # API services
├── styles/           # CSS styles
├── App.js            # Main application component
├── App.css           # Main application styles
├── index.js          # Application entry point
```

## Deployment

For production deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel
3. Deploy the application

## Integration with Backend

This frontend is designed to work with the StockChef backend API. Make sure the
backend server is running and accessible at the URL specified in your `.env`
file.

## License

This project is licensed under the MIT License - see the LICENSE file for
details.
