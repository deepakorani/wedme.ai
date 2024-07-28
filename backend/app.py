from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_community.llms import OpenAI
import openai
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from openai import OpenAI as op_object
from werkzeug.security import generate_password_hash, check_password_hash
import pinecone
import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, Index, ServerlessSpec
import pandas as pd

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Ensure the API keys are set
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")

if not OPENAI_API_KEY:
    raise ValueError("The OPENAI_API_KEY environment variable is not set")

if not PINECONE_API_KEY:
    raise ValueError("The PINECONE_API_KEY environment variable is not set")

if not PINECONE_ENVIRONMENT:
    raise ValueError("The PINECONE_ENVIRONMENT environment variable is not set")

# Initialize the OpenAI client
openai.api_key = OPENAI_API_KEY
clients = op_object(api_key=OPENAI_API_KEY)
llm = OpenAI(api_key=OPENAI_API_KEY)
prompt_template = PromptTemplate(
    input_variables=["event_type", "theme", "event_date"],
    template="Thank you for selecting the event type '{event_type}', theme '{theme}', and date '{event_date}'. Is there a location you would like to add?"
)
chain = LLMChain(llm=llm, prompt=prompt_template)

bcrypt = Bcrypt(app)

@app.before_request
def log_request_info():
    print('Headers: %s', request.headers)
    print('Body: %s', request.get_data())

# Initialize Pinecone and load model (do this once at startup)
pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = 'venues'
try:
    index = pc.Index(index_name)
    print(f"Successfully connected to Pinecone index: {index_name}")
except Exception as e:
    print(f"Error connecting to Pinecone index: {str(e)}")
    index = None

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

model = SentenceTransformer('all-MiniLM-L6-v2')
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

@app.route('/generatevendors', methods=['POST'])
def generate_vendors():
    try:
        vendor_type = request.json.get('vendorType', '')
        budget = request.json.get('budget', '')
        location = request.json.get('location', '')

        # Construct the prompt based on the inputs
        user_input = (f"Generate a list of vendors for {vendor_type} within a budget of {budget} "
                      f"in {location}. Include the name of the vendor and a short description. "
                      f"Please include links such as website and Instagram reference, etc. from where the descriptions are curated and contact information of vendors. Please do not add references which are invalid.")

        response = clients.chat.completions.create(
            model="gpt-4",  # Ensure the model name is correct
            messages=[{"role": "user", "content": user_input}]
        )
        message_content = response.choices[0].message.content
        vendors = message_content.split('\n')
        vendor_list = []
        for vendor in vendors:
            if vendor.strip():  # Only add non-empty strings
                parts = vendor.split(':', 1)
                if len(parts) == 2:
                    name, description = parts
                    vendor_list.append({'name': name.strip(), 'description': description.strip()})
                else:
                    vendor_list.append({'name': parts[0].strip(), 'description': ''})
        
        return jsonify({'response': vendor_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generatemenu', methods=['POST'])
def generate_menu():
    try:
        cuisine = request.json.get('cuisine', '')
        num_entrees = request.json.get('numEntrees', 0)
        num_appetizers = request.json.get('numAppetizers', 0)
        num_desserts = request.json.get('numDesserts', 0)

        # Construct the prompt based on the inputs
        user_input = (f"Generate a menu with {num_entrees} entrees, "
                      f"{num_appetizers} appetizers, and {num_desserts} desserts "
                      f"for a {cuisine} cuisine. Only stick to the inputs provided, if negative options selected state, this isn't possible.")

        response = clients.chat.completions.create(
            model="gpt-3.5-turbo",  # Ensure the model name is correct
            messages=[{"role": "user", "content": user_input}]
        )
        
        return jsonify({'response': response.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/select_event', methods=['POST'])
def select_event():
    data = request.json
    event_type = data.get('event_type')
    theme = data.get('theme')
    event_date = data.get('event_date')

    prompt_variables = {"event_type": event_type, "theme": theme, "event_date": event_date}

    if not event_type or not theme or not event_date:
        return jsonify({'message': 'Error: Event type, theme, and event date are required'}), 400
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
        response = clients.images.generate(
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

@app.route('/api/searchvenues', methods=['POST'])
def search_venues():
    try:
        data = request.json
        print('data is', data)
        query_text = data.get('query', '')
        top_k = data.get('top_k', 5)
        
        print(f"Received query: {query_text}, top_k: {top_k}")

        # Generate query embedding
        query_embedding = model.encode([query_text])[0].tolist()
        
        print(f"Generated embedding of length: {len(query_embedding)}")

        # Query the Pinecone index
        results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
        
        print(f"Pinecone results: {results}")

        # Process the results
        venues = []
        for result in results['matches']:
            venues.append({
                'score': result['score'],
                'name': result['metadata'].get('name', 'N/A'),
                'city': result['metadata'].get('city', 'N/A'),
                'state': result['metadata'].get('state', 'N/A'),
                'max_capacity': result['metadata'].get('max_capacity', 'N/A'),
                'description': result['metadata'].get('description', 'N/A'),
                'starting_price': result['metadata'].get('starting_price_cents', 0) / 100
            })
            print('result ', result)
        print(f"Returning {len(venues)} venues")
        return jsonify(venues)
    except Exception as e:
        print(f"Error in search_venues: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate_design', methods=['POST'])
def generate_design():
    data = request.json
    description = data.get('description')

    if not description:
        return jsonify({'message': 'Error: Design description is required'}), 400
    
    prompt = f"Generate a design: {description}"
    try:
        response = clients.images.generate(
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
