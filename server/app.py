from flask import Flask
from flask_cors import CORS

from config import db, migrate, bcrypt
from routes.auth_routes import auth_bp
from routes.recipe_routes import recipe_bp
from routes.recipe_group_routes import recipe_group_bp
from routes.meal_prep_routes import meal_prep_bp

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "dev-secret-key"

CORS(app, supports_credentials=True)

db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(recipe_bp)
app.register_blueprint(recipe_group_bp)
app.register_blueprint(meal_prep_bp)


@app.get("/")
def index():
    return {"message": "MealPrep Planner API is running"}


if __name__ == "__main__":
    app.run(port=5555, debug=True)