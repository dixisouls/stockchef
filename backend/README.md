# StockChef Backend

StockChef is a smart recipe generator that helps you create meals based on
what's already in your kitchen. It uses Gemini AI to extract food items from
images and generate personalized recipes based on your dietary preferences and
available ingredients.

## Features

- User authentication and profile management
- Dietary preference and cuisine preference selection
- Inventory management with manual and image-based item addition
- Recipe suggestions based on available inventory and user preferences
- Recipe history tracking
- Marking recipes as cooked to automatically update inventory

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI Services**: Google Gemini API
- **Authentication**: JWT
- **Deployment**: Ready for Heroku

## Setup Instructions

### Prerequisites

- Python 3.10+
- PostgreSQL
- Google Gemini API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dixisouls/stockchef-backend.git
   cd stockchef-backend
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

5. Initialize the database using the provided SQL script:

   ```bash
   psql -U postgres -d stockchef -a -f stockchef.sql
   ```

6. Copy the example environment variables file and update it:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your own configuration:
   - Update database credentials
   - Set a secure JWT secret key
   - Add your Gemini API key

### Running the Application

Start the server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation will be available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/token` - OAuth2 token endpoint

### Users

- `GET /api/users/me` - Get current user profile
- `GET /api/users/preferences` - Get available dietary preferences and cuisines
- `PUT /api/users/preferences` - Update user preferences

### Inventory

- `GET /api/inventory/` - Get current user's inventory
- `POST /api/inventory/item` - Add a single item to inventory
- `DELETE /api/inventory/item/{item_id}` - Remove an item from inventory
- `POST /api/inventory/upload-image` - Update inventory from image
- `POST /api/inventory/update-multiple` - Update inventory with multiple items

### Recipes

- `GET /api/recipes/history` - Get current user's recipe history
- `GET /api/recipes/{recipe_id}` - Get recipe details
- `POST /api/recipes/suggest` - Get recipe suggestions
- `POST /api/recipes/create` - Create a new recipe
- `POST /api/recipes/{recipe_id}/cook` - Mark recipe as cooked

## Deployment

This application is designed to be easily deployed to Heroku:

1. Create a Heroku app
2. Set up a PostgreSQL addon
3. Set the required environment variables
4. Deploy the code

## License

This project is licensed under the MIT License - see the LICENSE file for
details.
