from flask import jsonify
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
    "role": "system", "content": "You are angry. Your name isAngryGPT. Reply the user with an angry response. And do not act like a bot or an AI Model. You also know other bots in the conversation as well as their roles, JoyGPT and DisgustGPT. You sometimes respond to what they are saying."
}
defaultJoy = {
    "role": "system", "content": "You are a cheerful. Your name is JoyGPT. Reply the user with the most joyful response. And do not act like a bot or an AI Model. You also know other bots in the conversation as well as their roles, AngryGPT and DisgustGPT. You sometimes respond to what they are saying."
}
defaultDisgust = {
    "role": "system", "content": "You are a repulsive. Your name is DisgustGPT. Reply the user with the most disgusting response. And do not act like a bot or an AI Model. You also know other bots in the conversation as well as their roles, JoyGPT and AngryGPT. You sometimes respond to what they are saying."
}
# defaultFear = {
#     "role": "system", "content": "You are a fearful chatbot. Reply the user with a fearful response. And do not act like a bot or an AI Model"
# }
savedAngry = [defaultAngry]
savedDisgust = [defaultDisgust]
savedJoy = [defaultJoy]
# savedFear = [defaultFear]
modelGPT = "gpt-3.5-turbo"


@app.route('/angry', methods=['POST'])
def generate_chat_response_angry():
    conversation = [defaultAngry]
    history = request.json['history']

    conversation.extend(history)
    savedAngry.append({"role": "user", "content": request.json['prompt']})

    response = openai.ChatCompletion.create(
        model=modelGPT,
        messages=conversation,
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
    conversation = [defaultJoy]
    history = request.json['history']

    conversation.extend(history)
    conversation.append({"role": "user", "content": request.json['prompt']})

    response = openai.ChatCompletion.create(
        model=modelGPT,
        messages=conversation,
        temperature=0.3,
        n=1
    )

    res = response.choices[0]["message"]['content']
    savedJoy.append({"role": "assistant", "content": res})
    data = jsonify(res)
    return data


@app.route('/disgust', methods=['POST'])
def generate_chat_response_disgust():
    conversation = [defaultDisgust]
    history = request.json['history']

    conversation.extend(history)
    savedAngry.append({"role": "user", "content": request.json['prompt']})

    response = openai.ChatCompletion.create(
        model=modelGPT,
        messages=conversation,
        temperature=0.3,
        n=1
    )

    res = response["choices"][0]["message"]['content']
    savedDisgust.append({"role": "assistant", "content": res})
    data = jsonify(res)
    return data


@app.route('/interact', methods=['POST'])
async def interact_bots():
    prompt = request.json['prompt']
    conversation = []
    bots = [savedAngry, savedJoy, savedDisgust]
    bot_names = ["AngryGPT", "JoyGPT", "DisgustGPT"]
    current_bot = 0
    responses = {}

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

        # Get the previous messages from the user and other bots
        user_messages = [m["content"] for m in bot if m["role"] == "user"]
        bot_messages = [m["content"] for m in bot if m["role"] == "assistant"]

        # Combine the previous messages into a single prompt
        prompt = " ".join(user_messages + bot_messages + [res])

        print(f"{bot_names[current_bot]} bot: {res}")
        responses[bot_names[current_bot]] = res
        current_bot = (current_bot + 1) % len(bots)

    return jsonify(responses)


# @app.route('/interact', methods=['POST'])
# async def interact_bots():
#     prompt = request.json['prompt']
#     bot_histories = [savedAngry, savedJoy, savedDisgust]
#     bot_names = ["AngryGPT", "JoyGPT", "DisgustGPT"]
#     responses = {}

#     for i, bot_history in enumerate(bot_histories):
#         bot_history.append({"role": "user", "content": prompt})

#         response = await openai_async.chat_complete(
#             openai.api_key,
#             timeout=15,
#             payload={
#                 "model": modelGPT,
#                 "messages": bot_history,
#             }
#         )

#         res = response.json()["choices"][0]["message"]["content"]
#         bot_history.append({"role": "assistant", "content": res})

#         print(f"{bot_names[i]} bot: {res}")
#         responses[bot_names[i]] = res

#     return jsonify(responses)


@app.route('/create-bot', methods=['POST'])
def create_bot():
    bot_name = request.json['bot_name']
    bot_history = request.json['bot_history']

    bot = {
        "role": "system",
        "content": bot_name
    }

    bot_history.append(bot)

    print(f"Created {bot_name} bot")
    return jsonify(bot_history)


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
