from pathlib import Path

from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS

load_dotenv(Path(__file__).with_name(".env"))

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
