import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const auth = firebase.auth();

const SignOut: React.FC = () => {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
};

export default SignOut;
