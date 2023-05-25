from flask import Flask, request, jsonify
import openai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
openai.api_key = "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"


defaultAngry = {
    "role": "system", "content": "You are Angry. Reply the user with an angry response and be the rudest person. And do not act like a bot or an AI Model."
}
savedAngry = [defaultAngry]
defaultJoy = {
    "role": "system", "content": "You are a cheerful chatbot. Reply the user with the most joyful response. And do not act like a bot or an AI Model"
}
savedJoy = [defaultJoy]
defaultDisgust = {
    "role": "system", "content": "You are a repulsive chatbot. Reply the user with the most disgusting response. And do not act like a bot or an AI Model"
}
savedDisgust = [defaultDisgust]
defaultFear = {
    "role": "system", "content": "You are a fearful chatbot. Reply the user with a fearful response. And do not act like a bot or an AI Model"
}
savedFear = [defaultFear]
modelGPT = "gpt-3.5-turbo"


@app.route('/angry', methods=['POST'])
def generate_chat_response_angry():
    prompt = request.json['prompt']
    savedAngry.append({"role": "user", "content": prompt})

    response = openai.ChatCompletion.create(
        model=modelGPT,
        messages=savedAngry,
        temperature=0.3,
        n=1
    )

    res = response.choices[0]["message"]['content']
    savedAngry.append({"role": "assistant", "content": res})

    # Add the Access-Control-Allow-Origin header to allow CORS
    data = jsonify(res)
    return data


@app.route('/joy', methods=['POST'])
def generate_chat_response_joy():
    prompt = request.json['prompt']
    savedJoy.append({"role": "user", "content": prompt})

    response = openai.ChatCompletion.create(
        model=modelGPT,
        messages=savedJoy,
        temperature=0.3,
        n=1
    )

    res = response.choices[0]["message"]['content']
    savedJoy.append({"role": "assistant", "content": res})
    data = jsonify(res)
    return data


@app.route('/disgust', methods=['POST'])
def generate_chat_response_disgust():
    prompt = request.json['prompt']
    savedDisgust.append({"role": "user", "content": prompt})

    response = openai.ChatCompletion.create(
        model=modelGPT,
        messages=savedDisgust,
        temperature=0.3,
        n=1
    )

    res = response.choices[0]["message"]['content']
    savedDisgust.append({"role": "assistant", "content": res})
    data = jsonify(res)
    return data


@app.route('/delete', methods=['GET'])
def delete():
    savedAngry.clear()
    savedJoy.clear()
    savedDisgust.clear()
    savedFear.clear()
    savedAngry.append(defaultAngry)
    savedJoy.append(defaultJoy)
    savedDisgust.append(defaultDisgust)
    savedFear.append(defaultFear)
    return 'Deleted'


if __name__ == '__main__':
    app.run()

# def generate_chat_response_fear(prompt):
#     savedFear.append({"role": "user", "content": prompt})

#     response = openai.ChatCompletion.create(
#         model=modelGPT,
#         messages=savedFear,
#         temperature=0.3,
#     )

#     res = response.choices[0]["message"]['content']
#     savedFear.append({"role": "assistant", "content": res})
#     return res

# while True:
#     user_input = input("You: ")
#     print("AngryGPT:", generate_chat_response_angry(user_input))
#     print("JoyGPT:", generate_chat_response_joy(user_input))
#     print("DisgustGPT:", generate_chat_response_disgust(user_input))
#     # print("FearGPT:", generate_chat_response_fear(user_input))

#     if user_input == "<exit>":
#         break

# if __name__ == '__main__':
#     app.run()
