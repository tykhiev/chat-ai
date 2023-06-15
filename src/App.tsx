import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { auth } from "./firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";

const Authenticated = () => {
  const to = useNavigate();
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      to("/interactive");
    } else {
      to("/");
    }
  }, [user]);
  return (
    <section>
      <Outlet />
    </section>
  );
};

export default Authenticated;
