import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import "./Chat.css";
import { Link } from "react-router-dom";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firestore } from "../firebase/config";
import NavBar from "./Navbar";

const FLASK_SERVER_URL = import.meta.env.VITE_REACT_APP_API_URL;
console.log("FLASK_SERVER_URL:", FLASK_SERVER_URL);

interface Message {
  [x: string]: any;
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

const Chat: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // const messagesRef = firestore.collection("messages");
  // const query = messagesRef.orderBy("createdAt").limit(50);

  // const [messagesDoc] = useCollectionData(query, { idField: "id" });

  // useEffect(() => {
  //   console.log("messagesDoc:", messagesDoc);
  //   // TODO: set the message to local state, On data load from firestore
  //   setMessages(messagesDoc as unknown as Message[]);
  // }, [messagesDoc]);

  // function saveToFirestore(messagesToSave: Message[]) {
  //   // Save data to firestore
  // }

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

      // save 4 latest message to db including user, angry, joy, disgust
      // saveToFirestore([]);

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
      <NavBar />
      <div className="flex flex-col justify-items-center md:flex-row">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#69faf1] to-[#24c769] mb-2 md:mb-0">
            Chat with GPTs
          </h1>
        </div>
        <Link
          to="/interactive"
          className="justify-center mx-auto px-4 py-2 rounded-md bg-gradient-to-r bg-[#24c769] text-white font-bold border border-gray-800 mb-4 md:mb-0"
        >
          Go Interactive!
        </Link>
      </div>

      <div
        className={
          "opacity-80 w-full max-w-md max-h-[50rem] bg-white p-4 rounded-md shadow-md overflow-auto" +
          (messages.length ? "" : " hidden")
        }
      >
        {messages.map((msg, index) => (
          <p
            key={index}
            className={"mb-2 " + (msg.isUser ? "text-right" : "text-left")}
          >
            <strong className="font-bold">{msg.user}: </strong>
            <strong className="font-semibold">{msg.message}</strong>
          </p>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && (
          <p className="text-sm italic text-gray-500 opacity-50">
            GPTs are replying, please wait...
          </p>
        )}
      </div>
      <div className="w-full max-w-md flex-col items-center justify-center ">
        <form
          onSubmit={handleUserSubmit}
          className="w-full h-auto my-5 mb-5 flex flex-col md:flex-row justify-center"
        >
          <button
            onClick={handleDeleteHistory}
            type="button"
            className="mx-auto h-auto px-4 py-2 rounded-md bg-[#24c769] text-white font-bold border border-gray-800 mb-2 md:mb-0"
          >
            Clear
          </button>
          <input
            type="text"
            value={userInput}
            onChange={handleUserInput}
            placeholder="Begin your chat here"
            className="flex-grow h-auto mr-2 rounded-md py-2 px-3 border border-gray-800 mb-2 md:mb-0"
          />
          <button
            type="submit"
            className="px-4 py-2 mx-auto rounded-md bg-[#24c769] text-white font-bold border border-gray-800 mt-2 md:mt-0 md:ml-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
export default Chat;
