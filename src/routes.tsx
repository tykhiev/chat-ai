import { createBrowserRouter } from "react-router-dom";
import Chat from "./components/Chat";
import ChatInteractive from "./components/ChatInteractive";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Chat />,
  },
  {
    path: "/interactive",
    element: <ChatInteractive />,
  },
]);
