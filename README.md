# Mealstead

Mealstead is a full-stack meal planning app for saving recipes, organizing recipe groups, planning reusable weekly meals, and building grocery lists from saved recipes.

The project uses a React/Vite frontend and a Flask/SQLAlchemy backend with session-based authentication. It includes recipe search/import tools, S3 image uploads, grocery list helpers, and a floating recipe assistant.

## Features

- User signup, login, logout, and session persistence
- Protected user-specific recipes, recipe groups, meal prep boards, and grocery lists
- Recipe CRUD with ingredients, instructions, meal type, prep time, cook time, servings, favorites, source URL, and image URL
- Custom recipe groups plus built-in All Recipes and Favorites views
- Recipe image support with bundled defaults and direct-to-S3 uploads
- TheMealDB recipe search that can prefill the new recipe form
- Recipe URL import that reads structured recipe metadata when available
- Floating Mealstead assistant for recipe search and URL import
- Reusable weekly meal prep board with Breakfast, Lunch, and Dinner views
- Day/meal boards that can hold multiple saved recipes
- Meal prep preview cards that use the first recipe image for each day/meal board
- Grocery list CRUD with purchased item tracking
- Add selected recipe ingredients to grocery lists
- Grocery item merging for exact matching ingredient names
- Cozy farm-kitchen visual theme with custom assistant avatar assets

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, lucide-react
- Backend: Flask, SQLAlchemy, Flask-Migrate, Flask-Bcrypt, Flask-CORS
- Database: SQLite for local development
- Integrations: TheMealDB, OpenRouter, AWS S3

## Project Structure

```text
client/   React frontend
server/   Flask backend, models, routes, services, migrations
```

## Backend Setup

From the project root:

```powershell
cd server
pipenv install
pipenv run flask db upgrade
pipenv run python app.py
```

The backend runs on:

```text
http://127.0.0.1:5555
```

## Frontend Setup

Open a second terminal from the project root:

```powershell
cd client
npm install
npm.cmd run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173
```

Using `127.0.0.1` instead of `localhost` keeps the frontend and backend host names aligned so Flask session cookies work correctly.

## Environment Variables

Create `server/.env` using `server/.env.example` as a guide.

```text
DATABASE_URL=sqlite:///app.db
SECRET_KEY=change-this-in-production
FRONTEND_ORIGIN=http://127.0.0.1:5173
FLASK_ENV=development

AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-2
AWS_S3_BUCKET=your_bucket_name_here

AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_MODEL=openrouter/free
AI_APP_URL=http://127.0.0.1:5173
```

For local development, `DATABASE_URL=sqlite:///app.db` is enough. For deployment, set `DATABASE_URL` to the hosted Postgres connection string from Neon and set `SECRET_KEY` to a long random value.

The frontend API base URL defaults to `http://127.0.0.1:5555`. To override it later, create a client env file with:

```text
VITE_API_BASE_URL=http://127.0.0.1:5555
```

## Main App Flow

1. Sign up or log in.
2. Create a recipe manually, search TheMealDB, or import a recipe URL.
3. Review the prefilled recipe form and save the recipe.
4. Favorite recipes or organize them into custom groups.
5. Plan meals from the Meal Prep page by choosing Breakfast, Lunch, or Dinner.
6. Open a day board and add multiple saved recipes to that day/meal.
7. Create a grocery list and add selected ingredients from saved recipes.
8. Use the floating assistant to search for recipe ideas or import a recipe link.

## Current Notes

- Imported recipes are never saved automatically. They prefill the new recipe form so the user can review and edit before saving.
- The assistant is used to find existing recipes or recipe sources, not to create brand-new recipes from scratch.
- If AI is unavailable, TheMealDB search and URL import can still be used directly.
- Recipe URL import works best on pages that include schema.org/JSON-LD recipe metadata.
- The Meal Prep page is a reusable current-week planner, not a dated calendar.
- Deleting a recipe also removes it from meal prep boards, but grocery list items already created from it remain.

## Demo Checklist

- Sign up, refresh, and confirm the user stays logged in.
- Create or import a recipe with at least one ingredient.
- Upload or choose a recipe image.
- Favorite a recipe and add it to a custom group.
- Add multiple recipes to one Meal Prep day/meal board.
- Create a grocery list and add selected ingredients from a recipe.
- Mark grocery items purchased and confirm the checked state persists.
- Use the floating assistant to search for a recipe or import a recipe URL.

## Planned Later

- More AI assistant polish and stronger online recipe search coverage
- More advanced filtering and search
- Additional UI polish and animation
- Deployment with a hosted database

## Deployment Plan

Recommended deployment path:

- Frontend: Vercel
- Backend: Render
- Database: Neon Postgres
- Recipe images: existing AWS S3 bucket

Backend production environment variables:

```text
DATABASE_URL=postgresql://your_neon_connection_string
SECRET_KEY=your_long_random_secret
FRONTEND_ORIGIN=https://your-vercel-site.vercel.app
FLASK_ENV=production
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-2
AWS_S3_BUCKET=your_bucket_name_here
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_MODEL=openrouter/free
AI_APP_URL=https://your-vercel-site.vercel.app
```

Frontend production environment variable:

```text
VITE_API_BASE_URL=https://your-render-api.onrender.com
```

After setting the production database URL, run the Flask migrations against the deployed database before using the app.

Vercel uses `client/vercel.json` to route refreshed React pages back to `index.html`.
