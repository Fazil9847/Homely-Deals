import { useState } from "react";

export default function useWhatsAppLoading() {
  const [loading, setLoading] = useState(false);

  const openWhatsApp = (link) => {
    setLoading(true);

    setTimeout(() => {
      window.open(link, "_blank");
      setLoading(false);
    }, 700);
  };

  return { loading, openWhatsApp };
}