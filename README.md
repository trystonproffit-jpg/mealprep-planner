# Mealstead

Mealstead is a full-stack meal planning app for saving recipes, organizing them into groups, planning a reusable weekly meal prep board, and building grocery lists from saved recipes.

The app uses a React/Vite frontend and a Flask/SQLAlchemy backend with session-based authentication. It also includes TheMealDB recipe search, recipe URL import, OpenRouter-assisted recipe search, S3 recipe image uploads, and a floating recipe assistant.

## Features

- User signup, login, logout, and session persistence
- Protected user-specific recipes, recipe groups, meal prep slots, and grocery lists
- Recipe CRUD with ingredients, instructions, meal type, times, servings, favorites, source URL, and image URL
- Custom recipe groups plus built-in All Recipes and Favorites views
- TheMealDB recipe search and import into the new recipe form
- Recipe URL import using structured recipe metadata when available
- Floating Mealstead assistant for recipe search and URL import
- Weekly reusable meal prep planner with breakfast, lunch, and dinner slots
- Grocery list CRUD with purchased item tracking
- Add selected recipe ingredients to grocery lists
- Smarter grocery item merging for matching ingredients and quantities
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
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-2
AWS_S3_BUCKET=your_bucket_name_here

AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_MODEL=openrouter/free
AI_APP_URL=http://127.0.0.1:5173
```

The frontend API base URL defaults to `http://127.0.0.1:5555`. To override it later, create a client env file with:

```text
VITE_API_BASE_URL=http://127.0.0.1:5555
```

## Demo Flow

1. Sign up or log in.
2. Create or import a recipe.
3. Favorite a recipe and add it to a group.
4. Add a recipe to the weekly meal prep board.
5. Create a grocery list.
6. Add selected recipe ingredients to the grocery list.
7. Use the floating assistant to search for recipes or import a recipe URL.

## Notes

- Imported recipes are never saved automatically. The app prefills the new recipe form so the user can review and edit before saving.
- AI is used as a search assistant, not as an automatic recipe generator.
- If AI is unavailable, TheMealDB search and URL import can still be used directly.
- Recipe URL import works best on pages that include schema.org/JSON-LD recipe metadata.
