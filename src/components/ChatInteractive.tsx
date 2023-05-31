import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NavBar from "./Navbar";

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

  const handleUserInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
    <div className="py-14 interactive-svg flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <NavBar />
      <div className="mx-auto flex justify-items-center flex-col md:flex-row">
        <Link
          to={"/chat"}
          className="mx-auto text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e68535] to-[#a7331e] mb-2 md:mb-0"
        >
          Interactive Chat Group
        </Link>
        <Link
          to="/"
          className="mx-auto md:mx-2 px-4 py-2 rounded-md bg-[#e68535] text-white font-bold border border-gray-800 mb-2 md:mb-0"
        >
          Go Back Normal
        </Link>
      </div>

      <div
        className={
          "opacity-80 w-full max-w-md max-h-[50rem] bg-white p-4 rounded-md shadow-md overflow-auto mb-5" +
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
          className="w-full h-auto my-5 mb-5 flex flex-col md:flex-row justify-center"
        >
          <button
            onClick={handleDeleteHistory}
            type="button"
            className="mx-auto h-auto px-4 py-2 rounded-md bg-[#e68535] text-white font-bold border border-gray-800 mb-2 md:mb-0"
          >
            Clear
          </button>
          <textarea
            value={userInput}
            onChange={(e) => {
              handleUserInput(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleUserSubmit(e as unknown as FormEvent<HTMLFormElement>);
              }
            }}
            placeholder="Begin your chat here"
            className="flex-grow mx-auto md:mx-2 mt-2 md:mt-0 rounded-md py-2 px-3 border border-gray-800 w-full md:w-auto"
          />
          <button
            type="submit"
            className="mx-auto mt-2 md:mt-0 px-4 py-2 rounded-md bg-[#e68535] text-white font-bold border border-gray-800"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInteractive;
