from flask import Flask
from flask_cors import CORS

from config import db, migrate, bcrypt

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "dev-secret-key"

CORS(app, supports_credentials=True)

db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)


@app.get("/")
def index():
    return {"message": "MealPrep Planner API is running"}


if __name__ == "__main__":
    app.run(port=5555, debug=True)