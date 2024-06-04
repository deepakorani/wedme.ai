from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.chains import LLMChain
from langchain import PromptTemplate
from langchain import OpenAI
from openai import OpenAI as op
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
    input_variables=["event_type", "theme"],
    template="Thank you for selecting the event type '{event_type}' and theme '{theme}'. Is there a date you would like to add?"
)
chain = LLMChain(llm=llm, prompt=prompt_template)

@app.route('/api/select_event', methods=['POST'])
def select_event():
    data = request.json
    event_type = data.get('event_type')
    theme = data.get('theme')

    if not event_type or not theme:
        return jsonify({'message': 'Error: Event type and theme are required'}), 400

    prompt_variables = {"event_type": event_type, "theme": theme}
    response_message = chain.run(prompt_variables)

    return jsonify({'message': response_message})

@app.route('/api/generate_image', methods=['POST'])
def generate_image():
    data = request.json
    event_type = data.get('event_type')
    theme = data.get('theme')
    photo_url = data.get('photo_url')

    prompt = f"Genere a {theme} card with {event_type}"
    if photo_url:
        prompt += f" with reference photo: {photo_url}"

    try:
        response = client.images.generate(model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1)

        image_url = response.data[0].url
        return jsonify({'image_url': image_url})
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({'message': 'Error: Unable to process your request'}), 500

if __name__ == '__main__':
    app.run(debug=True)
