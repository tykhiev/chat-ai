import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const FLASK_SERVER_URL = import.meta.env.VITE_REACT_APP_API_URL;

interface Message {
  [x: string]: any;
  user: string;
  message: string;
}

const fetchBotResponse = async (
  message: string
): Promise<Record<string, string>> => {
  try {
    const response = await axios.post(`${FLASK_SERVER_URL}/interact`, {
      prompt: message,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching response from /interact:", error);
    return { error: "Error: Please try again in 1 min" };
  }
};
const ChatInteractive: React.FC = () => {
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

      const responses = await fetchBotResponse(userInput);
      for (const [botName, response] of Object.entries(responses)) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: botName, message: response },
        ]);
      }

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
    <div className="bg-svg flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="mx-auto flex justify-items-center">
        <h1 className="mx-auto text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Interactive Chat Group
        </h1>
        <Link
          to="/"
          className="mx-2 px-2 py-2 rounded-md bg-blue-500 text-white font-bold border border-gray-800 mb-2 md:mb-0"
        >
          Go Back Normal
        </Link>
      </div>

      <div
        className={
          "opacity-90 w-full max-w-md max-h-[50rem] bg-white p-4 rounded-md shadow-md overflow-auto" +
          (messages.length ? "" : " hidden")
        }
      >
        {messages.map((msg, index) => (
          <p
            key={index}
            className={"mb-2 " + (msg.isUser ? "text-right" : "text-left")}
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
      <div className="w-full max-w-md inline-flex items-center justify-center">
        <form
          onSubmit={handleUserSubmit}
          className="w-full my-5 mb-5 flex md:flex-row justify-center"
        >
          <button
            onClick={handleDeleteHistory}
            type="button"
            className="mx-auto h-auto px-4 py-2 rounded-md bg-blue-500 text-white font-bold border border-gray-800 mb-2 md:mb-0"
          >
            Clear
          </button>
          <input
            type="text"
            value={userInput}
            onChange={handleUserInput}
            placeholder="Begin your chat here"
            className="flex-grow mr-2 rounded-md py-2 px-3 border border-gray-800 mb-2 md:mb-0"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-500 text-white font-bold border border-gray-800"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInteractive;
