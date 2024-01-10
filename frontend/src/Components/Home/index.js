import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/fireBaseConfig";

import "./index.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userData = await signInWithPopup(auth, provider);
      const idToken = await userData.user.getIdToken();
      console.log(idToken);
    } catch (error) {
      console.error(error);
    }
  };
  const getUserFeed = async () => {
    navigate("/Userfeed");
  };

  return (
    <div className="container">
      <div className="b-1">
        <button
          onClick={handleGoogleLogin}
          className="sign-button mx-auto border-4 "
        >
          Signin with google
        </button>
        <button className="button" onClick={getUserFeed}>
          continue without signin
        </button>
      </div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Home;
