from flask import Flask, request, jsonify
import openai
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai_async

load_dotenv()

app = Flask(__name__)
CORS(app)
openai.api_key = os.getenv("API_KEY")


defaultAngry = {
    "role": "system", "content": "You are Angry. Reply the user with an angry response. And do not act like a bot or an AI Model. You also know other bots in the conversation as well as their roles, Joy and Disgust."
}
savedAngry = [defaultAngry]
defaultJoy = {
    "role": "system", "content": "You are a cheerful chatbot. Reply the user with the most joyful response. And do not act like a bot or an AI Model. You also know other bots in the conversation as well as their roles, Anger and Disgust."
}
savedJoy = [defaultJoy]
defaultDisgust = {
    "role": "system", "content": "You are a repulsive chatbot. Reply the user with the most disgusting response. And do not act like a bot or an AI Model. You also know other bots in the conversation as well as their roles, Joy and Anger."
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

    res = response["choices"][0]["message"]['content']
    savedDisgust.append({"role": "assistant", "content": res})
    data = jsonify(res)
    return data


@app.route('/interact', methods=['POST'])
async def interact_bots(num_turns=3):
    prompt = request.json['prompt']
    conversation = []
    bots = [savedAngry, savedJoy, savedDisgust]
    bot_names = ["Angry", "Joy", "Disgust"]
    current_bot = 0

    for bot in bots:
        bot.append({"role": "user", "content": prompt})

        response = await openai_async.chat_complete(
            openai.api_key,
            timeout=15,
            payload={
                "model": modelGPT,
                "messages": bot,
            }
        )

        res = response.json()["choices"][0]["message"]["content"]
        bot.append({"role": "assistant", "content": res})

        print(f"{bot_names[current_bot]} bot: {res}")
        prompt += f" {res}"
        current_bot = (current_bot + 1) % len(bots)

    return 'done'


@app.route('/chat-group', methods=['POST'])
def chat_group():
    chatbot_roles = ['assistant', 'system', 'user']
    chatbot_prompts = [savedAngry, savedJoy, savedDisgust]
    chatbot_response = []

    user_input = request.json['prompt']

    conversation = [{"role": "user", "text": user_input}]

    for _ in range(3):  # Number of interactions between chatbots
        for role, prompt in zip(chatbot_roles, chatbot_prompts):
            conversation_copy = [{"role": "user", "text": user_input}] + prompt

            response = openai.Completion.create(
                engine="davinci",
                prompt=conversation_copy,
                temperature=0.3,
                max_tokens=60,
                n=1,
                stop=None,
            )

            res = response.choices[0].text
            conversation.append({"role": role, "text": res})

    data = jsonify({"messages": conversation})
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
    app.run(host='0.0.0.0', port=5000)

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
