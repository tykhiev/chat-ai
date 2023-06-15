import { createBrowserRouter } from "react-router-dom";
import Chat from "./components/Chat";
import ChatInteractive from "./components/ChatInteractive";
import SignIn from "./components/Signin.tsx";
import Authenticated from "./App.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Authenticated />,
    children: [
      {
        path: "/",
        element: <SignIn />,
      },
      {
        path: "/interactive",
        element: <ChatInteractive />,
      },
    ],
  },
  {
    path: "/chat",
    element: <Chat />,
  },
]);
