import { auth, user } from "../firebase/config";

export const requireAuthentication = () => {
  if (!user) {
    window.location.href = "/";
  }
  return auth.currentUser;
};
