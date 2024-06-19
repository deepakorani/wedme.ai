from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.chains import LLMChain
from langchain import PromptTemplate
from langchain import OpenAI
from openai import OpenAI as op
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(app)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
client = op(api_key=OPENAI_API_KEY)
# Set up LangChain with OpenAI LLM
llm = OpenAI(api_key=OPENAI_API_KEY)
prompt_template = PromptTemplate(
    input_variables=["event_type", "theme", "event_date"],
    template="Thank you for selecting the event type '{event_type}', theme '{theme}', and date '{event_date}'. Is there a location you would like to add?"
)
chain = LLMChain(llm=llm, prompt=prompt_template)

bcrypt = Bcrypt(app)

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# User Model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes for user authentication
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        return jsonify({'token': 'dummy-token'}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/select_event', methods=['POST'])
def select_event():
    data = request.json
    event_type = data.get('event_type')
    theme = data.get('theme')
    event_date = data.get('event_date')

    if not event_type or not theme or not event_date:
        return jsonify({'message': 'Error: Event type, theme, and event date are required'}), 400

    prompt_variables = {"event_type": event_type, "theme": theme, "event_date": event_date}
    response_message = chain.run(prompt_variables)

    return jsonify({'message': response_message})

@app.route('/api/generate_image', methods=['POST'])
def generate_image():
    data = request.json
    event_type = data.get('event_type')
    theme = data.get('theme')
    couple_name = data.get('couple_name')
    event_date = data.get('event_date')
    event_location = data.get('event_location')
    photo_url = data.get('photo_url')

    prompt = f"Generate a {theme} card for a {event_type} of {couple_name} at {event_location} on {event_date}."
    if photo_url:
        prompt += f" Include the reference photo: {photo_url}"

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )

        image_url = response.data[0].url
        return jsonify({'image_url': image_url})
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({'message': 'Error: Unable to process your request'}), 500

@app.route('/api/generate_design', methods=['POST'])
def generate_design():
    data = request.json
    description = data.get('description')

    if not description:
        return jsonify({'message': 'Error: Design description is required'}), 400
    
    prompt = f"Generate a design: {description}"
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1
        )
        image_url = response.data[0].url
        return jsonify({'image_url': image_url})
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({'message': 'Error: Unable to process your request'}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create the tables
    app.run(debug=True)
