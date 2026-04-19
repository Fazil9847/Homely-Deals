import { useCallback, useEffect, useState } from "react";

const DEFAULT_MESSAGE = "Session expired. Please login to continue.";

function useSessionInterruptionMessage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleTokenExpired = (event) => {
      setMessage(event?.detail?.message || DEFAULT_MESSAGE);
    };

    const handleSessionRestored = () => {
      setMessage("");
    };

    window.addEventListener("tokenExpired", handleTokenExpired);
    window.addEventListener("sessionRestored", handleSessionRestored);

    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
      window.removeEventListener("sessionRestored", handleSessionRestored);
    };
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return { message, clearMessage };
}

export default useSessionInterruptionMessage;
