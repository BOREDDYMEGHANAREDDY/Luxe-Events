import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email/${token}`
        );

        setSuccess(true);
        setMessage(res.data.message);
      } catch (err) {
        setSuccess(false);
        setMessage(
          err.response?.data?.message || "Verification failed."
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <div
        style={{
          width: 500,
          padding: 40,
          borderRadius: 10,
          background: "#111",
          textAlign: "center",
        }}
      >
        {loading ? (
          <>
            <h2>Verifying your email...</h2>
            <p>Please wait.</p>
          </>
        ) : success ? (
          <>
            <h1 style={{ color: "#B8960C" }}>✓ Email Verified</h1>

            <p>{message}</p>

            <Link
              to="/login"
              style={{
                display: "inline-block",
                marginTop: 25,
                background: "#B8960C",
                color: "#000",
                padding: "12px 30px",
                textDecoration: "none",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ color: "red" }}>Verification Failed</h1>

            <p>{message}</p>

            <Link
              to="/login"
              style={{
                display: "inline-block",
                marginTop: 25,
                background: "#B8960C",
                color: "#000",
                padding: "12px 30px",
                textDecoration: "none",
                borderRadius: 6,
              }}
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;