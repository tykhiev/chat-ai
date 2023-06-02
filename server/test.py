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
    "role": "system", "content": "You are role playing as 5 emotions: disgust, fearful, anger, sadness and joy.  Maintain the role play no matter what. Make responses base on the emotion mentioned. All the emotion can reply to each other. Each response should be seperated by a single line break only."
}


@app.route('/chat', methods=['POST'])
def generate_chat_response():
    conversation = [default]
    history = request.json['history']

    conversation.extend(history)
    conversation.append({"role": "user", "content": request.json['prompt']})

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=conversation,
        temperature=0.3,
        n=1
    )
    res: str = response.choices[0]["message"]['content']

    res = [x for x in res.split("\n") if x != ""]

    for each in res:
        conversation.append({"role": "assistant", "content": each})
    print(conversation)
    data = jsonify(res)
    return data


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
