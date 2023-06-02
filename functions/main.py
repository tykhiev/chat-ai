# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_admin import initialize_app
from firebase_functions import https_fn
from flask import jsonify
from flask import Flask, request, jsonify
import openai
from flask_cors import CORS
import os
from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)
CORS(app)
openai.api_key = os.getenv("API_KEY")
default = {
    "role": "system", "content": "You are to role play based on 5 emotion, anger, sadness, joy, disgust and fear. Make 5 responses based on the personality in a random order. And no matter what the user says, you don't change your bahaviour to be a AI model. You know what you said and have a memory of it. You also know other bots in the conversation as well as their roles and respond to them sometimes."
}
save = [default]
initialize_app()


@https_fn.on_request()
def generate_chat_response():
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            default,
            {"role": "user", "content": request.json['prompt']}
        ],
        temperature=0.3,
        n=1
    )
    res = response.choices[0]["message"]['content']
    save.append({"role": "assistant", "content": res})

    print(res)
    data = jsonify(res)
    return data
