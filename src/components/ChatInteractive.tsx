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
import { auth, firestore } from "../firebase/config";
import firebase from "firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const FLASK_SERVER_URL = import.meta.env.VITE_REACT_APP_API_URL;

interface Message {
  [x: string]: any;
  user: string;
  message: string;
}
const fetchBotResponse = async (
  content: string,
  history: Message[]
): Promise<Message[] | null> => {
  const mappedHistory = history.map((msg) => {
    return {
      role: msg.user === "You" ? "user" : "assistant",
      content: msg.content,
    };
  });
  try {
    const response = await axios.post(`${FLASK_SERVER_URL}/conversation`, {
      prompt: content,
      history: mappedHistory,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching response from /interact:", error);
    return null;
  }
};

const ChatInteractive: React.FC = () => {
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
        .collection("messages_interactive")
        .doc(user.uid)
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
      const newMessages: Message[] = [
        ...messages,
        { user: "You", message: userInput, isUser: true },
      ];

      setMessages(newMessages);
      setUserInput("");
      setIsLoading(true);

      const responses = await fetchBotResponse(userInput, newMessages);
      responses?.forEach((each) => {
        newMessages.push(each);
        setMessages([...newMessages]);
      });

      await saveToFirestore(newMessages);

      setIsLoading(false);
      console.log("newMessages", newMessages);
    }
  };

  async function saveToFirestore(newMessages: Message[]) {
    if (!docExist) {
      await firestore.collection("messages_interactive").doc(user?.uid).set({
        history: newMessages,
      });
      setDocExist(true);
      return;
    }

    await firestore
      .collection("messages_interactive")
      .doc(user?.uid)
      .update({
        history: firebase.firestore.FieldValue.arrayUnion(...newMessages),
      });
  }

  const handleDeleteHistory = async () => {
    try {
      await firestore
        .collection("messages_interactive")
        .doc(user?.uid)
        .delete();
      setMessages([]);
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  return (
    <div className="py-14 interactive-svg flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <NavBar />
      <div className=" py-2 mx-auto flex justify-items-center flex-col md:flex-row">
        <div className="mx-3">
          <h1 className="text-3xl md:text-4xl text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e68535] to-[#a7331e] mb-2 md:mb-0">
            AI Podcast
          </h1>
        </div>
        <Link
          to="/chat"
          className="mx-auto md:mx-2 px-4 py-2 rounded-md bg-[#e68535] text-white font-bold border border-gray-800 mb-2 md:mb-0"
        >
          Go Normal
        </Link>
      </div>
      <p className="text-center text-lg mb-5  font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e68535] to-[#a7331e]">
        Chat with our Economist and Business Analyst.
      </p>

      <p className="text-center text-sm mb-5  font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e68535] to-[#a7331e]">
        Try in a minute gap.
      </p>

      <div
        className={
          "opacity-80 w-full max-w-md max-h-[50rem] bg-white p-4 rounded-md shadow-md overflow-auto mb-5" +
          (messages.length ? "" : " hidden")
        }
      >
        {/* render message */}
        {messages.map((msg, index) => (
          <p
            key={index}
            className={"mb-2 " + (msg.isUser ? "text-right" : "text-left")}
          >
            <strong className="font-semibold">{msg?.user}:</strong>{" "}
            {msg?.message}
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
              className={`mt-2 md:mt-0 px-4 py-2 rounded-md text-white font-bold border border-gray-800 bg-[#e68535]`}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInteractive;
