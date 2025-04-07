import json
import os
import logging
from typing import Dict, List, Optional

from google import genai
from google.genai import types
from PIL import Image

from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini API with API key
client = genai.Client(api_key=settings.GEMINI_API_KEY)
model = "gemini-2.0-flash"


def extract_items_from_image(image_data: bytes) -> Dict:
    """
    Extract food items from an image using Gemini API

    Args:
        image_data: Raw image bytes

    Returns:
        dict: A dictionary containing status and items list
    """
    try:
        # Define the image extraction prompt with examples
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(
                        text="""You will be given an image. You need to extract all the food items from the image. Basically the image can be their fridge, their shelves or straight up food. Extract all the food items from the image and return them. The output json should have two things.
1. Status : 200 if food found, 404 no food found
2. items: list of items

If no food found the items list should be empty.
Just return the items, no quantity, unit etc, just the items"""
                    ),
                ],
            ),
            types.Content(
                role="model",
                parts=[
                    types.Part.from_text(
                        text="""{
  \"status\": \"404\",
  \"items\": []
}"""
                    ),
                ],
            ),
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(data=image_data, mime_type="image/jpeg"),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json",
        )
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )

        # Parse JSON response
        try:
            result = json.loads(response.text)
            logger.info(
                f"Successfully extracted items: {len(result.get('items', []))} items found"
            )
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response text: {response.text}")
            return {"status": "404", "items": []}

    except Exception as e:
        logger.error(f"Error in extract_items_from_image: {str(e)}")
        return {"status": "404", "items": []}


def generate_recipes(
    ingredients: List[str],
    dietary_preference: str,
    cuisine_preference: str,
    previous_recipes: List[str] = [],
) -> Dict:
    """
    Generate recipe suggestions based on ingredients and preferences

    Args:
        ingredients: List of available ingredients
        dietary_preference: User's dietary preference (vegetarian, vegan, etc.)
        cuisine_preference: User's preferred cuisine (Italian, Indian, etc.)
        previous_recipes: List of previously cooked recipes

    Returns:
        dict: A dictionary containing recipe suggestions
    """
    try:
        # Build the input payload
        input_payload = {
            "ingredients": ingredients,
            "dietary_preference": dietary_preference,
            "cuisine_preference": cuisine_preference,
            "previous_recipes": previous_recipes,
        }

        # Define the recipe generation prompt with examples
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(
                        text="""You will be given a list of ingredients, dietary preferences (vegan, vegetarian [dairy but no eggs], halal, non-veg, etc.) and preferred cuisine (Indian, Mexican, Japanese, etc.). You will also have a previous recipe made. Return three recipes. Assume the basic things such as water, salt, sugar, ginger, etc., spices and condiments to be available. Two recipes aligning to cuisine preference, one can be a random cuisine. Try to not give the previous recipe, but if there are no ingredients, then you can return the same recipe. If you can make a recipe out of the ingredients but cannot adhere to the cuisine preference, then still return it but make sure to strictly align to dietary preference. If you cannot return three recipes, that's fine—return as many as you can generate, but a maximum of three. You dont need to utilize all the available ingredients, I mean you can use all, or a subset.

Follow these steps in returning the output:

1) 200 if you can at least generate one, 400 if you cannot generate any or the ingredient list has nothing. Make sure, if you cannot generate any recipe to return 400. and 200 if you can generate atleast 1.
2) First recipe
    2.1) status 200 if you were able to generate the recipe, 400 if not due to any reason, then keep all other things empty
    2.2) Recipe name
    2.3) Short description
    2.4) ingredient list as needed(make sure available from the original list provided to you), only the ingredients, nothing else such as 1 pound, for garnish etc, just the ingredient list.
    2.5) approx time to make
    2.6) Actual step by step recipe.(this should be in extreme detail guiding the user step by step for each task)
3) Second recipe
    3.1) status 200 if you were able to generate the recipe, 400 if not due to any reason, then keep all other things empty
    3.2) Recipe name
    3.3) Short description
    3.4) ingredient list as needed(make sure available from the original list provided to you), only the ingredients, nothing else such as 1 pound, for garnish etc, just the ingredient list.
    3.5) approx time to make
    3.6) Actual step by step recipe.(this should be in extreme detail guiding the user step by step for each task)
4) Third recipe
    4.1) status 200 if you were able to generate the recipe, 400 if not due to any reason, then keep all other things empty
    4.2) Recipe name
    4.3) Short description
    4.4) ingredient list as needed(make sure available from the original list provided to you), only the ingredients, nothing else such as 1 pound, for garnish etc, just the ingredient list.
    4.5) approx time to make
    4.6) Actual step by step recipe.(this should be in extreme detail guiding the user step by step for each task)

"""
                    ),
                ],
            ),
            types.Content(
                role="model",
                parts=[
                    types.Part.from_text(
                        text="""{
  \"recipes\": [
    {
      \"status\": 200,
      \"recipe_name\": \"Vegan Chickpea Curry (Chana Masala)\",
      \"description\": \"A classic Indian vegan curry made with chickpeas in a flavorful tomato-based sauce.\",
      \"ingredients\": [
        \"Chickpeas\",
        \"Tomato\",
        \"Onion\",
        \"Garlic\",
        \"Ginger\",
        \"Cilantro\",
        \"Spices\"
      ],
      \"approx_time\": \"45 minutes\",
      \"steps\": [
        \"Soak chickpeas overnight or use canned chickpeas.\",
        \"If using dried chickpeas, boil them until tender.\",
        \"Finely chop onion, garlic, and ginger.\",
        \"Heat oil in a pot or pan. Add onion and sauté until golden brown.\",
        \"Add garlic and ginger and sauté for another minute.\",
        \"Add chopped tomatoes and cook until they soften.\",
        \"Add spices such as turmeric powder, cumin powder, coriander powder, and garam masala. Adjust spices to your taste.\",
        \"Add the cooked chickpeas to the sauce.\",
        \"Add water to adjust the consistency.\",
        \"Simmer for 20-25 minutes, allowing the flavors to meld together.\",
        \"Garnish with chopped cilantro.\",
        \"Serve hot with rice or roti.\"
      ]
    },
    {
      \"status\": 200,
      \"recipe_name\": \"Vegan Black Bean Tacos\",
      \"description\": \"Delicious and easy vegan tacos filled with seasoned black beans and your favorite toppings.\",
      \"ingredients\": [
        \"Black Beans\",
        \"Onion\",
        \"Garlic\",
        \"Tomato\",
        \"Cilantro\",
        \"Taco Shells\",
        \"Spices\"
      ],
      \"approx_time\": \"30 minutes\",
      \"steps\": [
        \"Finely chop onion and garlic.\",
        \"Heat oil in a pan. Add onion and sauté until translucent.\",
        \"Add garlic and sauté for another minute.\",
        \"Add black beans (canned or cooked) to the pan.\",
        \"Add spices such as cumin powder, chili powder, and smoked paprika.\",
        \"Mash some of the black beans to create a creamy texture.\",
        \"Cook for 10-15 minutes, stirring occasionally.\",
        \"Warm the taco shells according to package directions.\",
        \"Fill the taco shells with the black bean mixture.\",
        \"Top with your favorite toppings such as chopped tomatoes, cilantro, and salsa.\",
        \"Serve immediately.\"
      ]
    },
    {
      \"status\": 200,
      \"recipe_name\": \"Vegan Lentil Soup\",
      \"description\": \"A hearty and nutritious lentil soup perfect for a comforting meal.\",
      \"ingredients\": [
        \"Lentils\",
        \"Onion\",
        \"Garlic\",
        \"Tomato\",
        \"Carrot\",
        \"Celery\",
        \"Vegetable Broth\",
        \"Spices\"
      ],
      \"approx_time\": \"50 minutes\",
      \"steps\": [
        \"Finely chop onion, garlic, carrot, and celery.\",
        \"Heat oil in a pot.\",
        \"Add onion, carrot, and celery and sauté until softened.\",
        \"Add garlic and sauté for another minute.\",
        \"Add lentils to the pot.\",
        \"Add chopped tomatoes and vegetable broth.\",
        \"Add spices such as cumin powder, coriander powder, and bay leaf.\",
        \"Bring to a boil, then reduce heat and simmer for 30-40 minutes, or until the lentils are tender.\",
        \"Remove the bay leaf.\",
        \"Use an immersion blender to partially blend the soup for a creamier texture (optional).\",
        \"Season with salt and pepper to taste.\",
        \"Serve hot with crusty bread.\"
      ]
    }
  ],
  \"status\": 200
}"""
                    ),
                ],
            ),
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=json.dumps(input_payload)),
                ],
            ),
        ]
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="application/json",
            system_instruction=[
                types.Part.from_text(
                    text="""You are an expert chef. You know all the recipes in the world. Given the ingredient list, dietary  preference, cuisne preference, you can suggest any recipe keeping in mind these things. You can also change recipes according to availabe ingredients and dietray preference."""
                ),
            ],
        )

        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )

        # Parse JSON response
        try:
            result = json.loads(response.text)
            logger.info(f"Successfully generated recipes: {result.get('status')}")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response text: {response.text}")
            return {"status": 400, "recipes": []}

    except Exception as e:
        logger.error(f"Error in generate_recipes: {str(e)}")
        return {"status": 400, "recipes": []}
