import firebase from "firebase/app";
import { auth } from "../firebase/config";
import "./Signin.css";

const SignIn: React.FC = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <section className="bg-signin-svg flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-gradient">
        AI Assistant
      </h1>
      <h2 className="text-4xl font-bold text-gray-800 items-center justify-center text-center">
        Let's get started
      </h2>
      <div className="flex flex-col space-y-4">
        <button
          onClick={signInWithGoogle}
          className="min-w-min bg-purple-500 hover:bg-blue-700 text-white font-bold mx-20 py-3 px-2.5 shadow-md rounded-2xl duration-200 ease-in-out flex items-center justify-center space-x-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="fill-current"
          >
            <path
              d="M20.16 12.193c0-.603-.054-1.182-.155-1.739H12v3.288h4.575a3.91 3.91 0 0 1-1.696 2.565v2.133h2.747c1.607-1.48 2.535-3.659 2.535-6.248z"
              fill="#4285f4"
            ></path>
            <path
              d="M12 20.5c2.295 0 4.219-.761 5.625-2.059l-2.747-2.133c-.761.51-1.735.811-2.878.811-2.214 0-4.088-1.495-4.756-3.504h-2.84v2.202A8.497 8.497 0 0 0 12 20.5z"
              fill="#34a853"
            ></path>
            <path
              d="M7.244 13.615A5.11 5.11 0 0 1 6.977 12a5.11 5.11 0 0 1 .267-1.615V8.183h-2.84C3.828 9.33 3.5 10.628 3.5 12s.328 2.67.904 3.817l2.84-2.202z"
              fill="#fbbc05"
            ></path>
            <path
              d="M12 6.881c1.248 0 2.368.429 3.249 1.271l2.438-2.438C16.215 4.342 14.291 3.5 12 3.5a8.497 8.497 0 0 0-7.596 4.683l2.84 2.202C7.912 8.376 9.786 6.881 12 6.881z"
              fill="#ea4335"
            ></path>
          </svg>
          <span>Sign in with Google</span>
        </button>
        <p className="text-gray-800 flex flex-col text-center space-y-6">
          By continuing, you are agreeing to our Terms of Service and Privacy
          Policy.
        </p>
        {/* <button
          onClick={signInWithFacebook}
          className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
        >
          Sign in with Facebook
        </button>
        <button
          onClick={signInWithGitHub}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
        >
          Sign in with GitHub
        </button> */}
      </div>
    </section>
  );
};

export default SignIn;
