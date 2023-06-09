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
import NavBar from "./Navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { firestore } from "../firebase/config";
import firebase from "firebase";

const FLASK_SERVER_URL = "http://localhost:5000";

interface Message {
  [x: string]: any;
  user: string;
  message: string;
}

const fetchBotResponse = async (
  message: string,
  history: Message[]
): Promise<string[]> => {
  const mappedHistory = history.map((msg) => {
    return {
      role: msg.user === "You" ? "user" : "assistant",
      content: msg.message,
    };
  });
  try {
    const response = await axios.post(`${FLASK_SERVER_URL}/chat`, {
      prompt: message,
      history: mappedHistory,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching response from chat endpoint:`, error);
    return ["Sorry, I'm having trouble connecting to the server."];
  }
};

const NewChat: React.FC = () => {
  const [user] = useAuthState(auth);

  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [docExist, setDocExist] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (user) {
      firestore
        .collection("messages_new")
        .doc(user?.uid)
        .get()
        .then((doc) => {
          setMessages(doc.data()?.history || []);
          setDocExist(Boolean(doc.data()?.history));
        });
    }
  }, [user]);

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

      const botResponse = await fetchBotResponse(userInput, messages);
      const mapped = botResponse.map((msg) => {
        return {
          user: msg.split(":")[0],
          message: msg.split(":")[1],
        };
      });

      setMessages((prevMessages) => [...prevMessages, ...mapped]);

      // save 4 latest messages to db including user, angry, joy, disgust
      await saveToFirestore([
        { user: "You", message: userInput, isUser: true },
        ...mapped,
      ]);

      setIsLoading(false);
    }
  };

  async function saveToFirestore(newMessages: Message[]) {
    if (!docExist) {
      await firestore.collection("messages_new").doc(user?.uid).set({
        history: newMessages,
      });
      setDocExist(true);
      return;
    }

    await firestore
      .collection("messages_new")
      .doc(user?.uid)
      .update({
        history: firebase.firestore.FieldValue.arrayUnion(...newMessages),
      });
  }

  const handleDeleteHistory = async () => {
    try {
      await firestore.collection("messages_new").doc(user?.uid).delete();
      setMessages([]);
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };
  return (
    <div className="py-14 bg-svg flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <NavBar />
      <div className="py-2 flex flex-col justify-items-center md:flex-row">
        <div className="mx-3">
          <h1 className="text-3xl md:text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#69faf1] to-[#24c769] mb-2 md:mb-0">
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
          className="w-full h-auto my-5 mb-5 flex flex-col justify-center gap-2"
        >
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
            className="flex-grow mt-2 md:mt-0 rounded-md py-2 px-3 border border-gray-800 w-full md:w-auto"
          />
          <div className="w-full flex justify-between">
            <button
              onClick={handleDeleteHistory}
              type="button"
              className="h-auto px-4 py-2 rounded-md bg-red-400 text-white font-bold border border-gray-800 mb-2 md:mb-0"
            >
              Clear
            </button>
            <button
              type="submit"
              className="mt-2 md:mt-0 px-4 py-2 rounded-md bg-[#24c769] text-white font-bold border border-gray-800"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NewChat;
