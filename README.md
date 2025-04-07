# StockChef - Smart Recipe Generator

StockChef is an AI-powered application that helps users generate personalized
recipes based on the ingredients they already have. By leveraging Google's
Gemini AI, StockChef can extract food items from images and suggest recipes
tailored to users' dietary preferences and available ingredients.

## Features

- **User Authentication**: Secure registration and login system with JWT
  authentication
- **Personalized Profiles**: Set dietary preferences (vegetarian, vegan, halal,
  etc.) and cuisine preferences
- **Inventory Management**:
  - Add ingredients manually
  - Upload photos of your fridge/pantry to automatically extract food items
  - Track inventory as you cook recipes
- **Recipe Suggestions**: Get personalized recipe recommendations based on:
  - Available ingredients in your inventory
  - Dietary preferences
  - Cuisine preferences
  - Previous cooking history
- **Recipe Management**:
  - View detailed step-by-step cooking instructions
  - Mark recipes as cooked, automatically updating your inventory
  - Browse your cooking history

## Tech Stack

### Backend

- **Language**: Python 3.10+
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT
- **AI Services**: Google Gemini API
- **Deployment**: Ready for Heroku

### Frontend

- **Framework**: React.js
- **Routing**: React Router
- **State Management**: Context API
- **Styling**: Custom CSS
- **Deployment**: Ready for Vercel

## Project Structure

```
stockchef/
├── backend/             # FastAPI backend
│   ├── app/             # Application code
│   │   ├── api/         # API endpoints
│   │   ├── db/          # Database models and config
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── utils/       # Utility functions
│   │   ├── config.py    # Application config
│   │   └── main.py      # Application entry point
│   └── requirements.txt # Python dependencies
│
├── frontend/            # React frontend
│   ├── public/          # Static files
│   ├── src/             # Source code
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context for state management
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── styles/      # CSS styles
│   └── package.json     # Node.js dependencies
│
└── README.md            # This file
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL database
- Google Gemini API key

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/dixisouls/stockchef.git
   cd stockchef/backend
   ```

2. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a PostgreSQL database:

   ```sql
   CREATE DATABASE stockchef;
   ```

5. Initialize the database with the provided SQL script:

   ```bash
   psql -U postgres -d stockchef -a -f stockchef.sql
   ```

6. Create a `.env` file in the backend directory with the following variables:

   ```
   # Database settings
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   POSTGRES_SERVER=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=stockchef

   # JWT settings
   SECRET_KEY=generate_a_secure_random_key

   # Gemini API settings
   GEMINI_API_KEY=your_gemini_api_key
   ```

7. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:

   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

Once the backend is running, you can access the API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

### Backend Deployment (Heroku)

1. Create a Heroku app
2. Add the PostgreSQL addon
3. Set all the required environment variables
4. Deploy the backend code

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure the environment variables
3. Deploy the frontend code

## License

This project is licensed under the MIT License.

## Contributors

- [dixisouls](https://github.com/dixisouls)
