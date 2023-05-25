import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import "./App.css";

const FLASK_SERVER_URL = import.meta.env.API_URL;

interface Message {
  user: string;
  message: string;
}

const fetchBotResponse = async (
  endpoint: string,
  message: string
): Promise<string> => {
  try {
    const response = await axios.post(`${FLASK_SERVER_URL}/${endpoint}`, {
      prompt: message,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching response from ${endpoint}:`, error);
    return `Error: Please try again in 1 min`;
  }
};

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleUserSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userInput.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: "You", message: userInput, isUser: true },
      ]);

      setUserInput("");
      setIsLoading(true);

      const angryResponse = await fetchBotResponse("angry", userInput);
      const joyResponse = await fetchBotResponse("joy", userInput);
      const disgustResponse = await fetchBotResponse("disgust", userInput);

      setMessages((prevMessages) => [
        ...prevMessages,
        { user: "AngryGPT", message: angryResponse },
        { user: "JoyGPT", message: joyResponse },
        { user: "DisgustGPT", message: disgustResponse },
      ]);

      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async () => {
    try {
      await axios.get(`${FLASK_SERVER_URL}/delete`);
      setMessages([]);
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  return (
    <div className="bg-svg flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-5">Chat with Bots</h1>

      <div
        className={
          "w-full max-w-md max-h-[50rem] bg-white p-4 rounded-md shadow-md overflow-auto" +
          (messages.length ? "" : "hidden")
        }
      >
        {messages.map((msg, index) => (
          <p
            key={index}
            className={
              "mb-2 " + (msg.user ? "text-right" : "text-left") // Add this line
            }
          >
            <strong className="font-semibold">{msg.user}:</strong> {msg.message}
          </p>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && (
          <p className="text-sm italic text-gray-500 opacity-50">
            Bots are replying, please wait...
          </p>
        )}
      </div>
      <form
        onSubmit={handleUserSubmit}
        className="flex w-full my-5 max-w-md mb-5"
      >
        <button
          onClick={handleDeleteHistory}
          type="button"
          className="mx-auto px-4 py-2 rounded-md bg-blue-500 text-white font-bold border border-gray-800"
        >
          Clear
        </button>
        <input
          type="text"
          value={userInput}
          onChange={handleUserInput}
          placeholder="Begin your chat here"
          className="flex-grow mr-2 rounded-md py-2 px-3 border border-gray-800"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-500 text-white font-bold border border-gray-800"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default App;
