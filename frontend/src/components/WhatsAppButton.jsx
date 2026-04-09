import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton({ phone }) {
  if (!phone) return null;

  const message = "Hi, I'm interested in your furniture";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <span className="absolute right-20 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        Chat with us
      </span>

      {/* Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition duration-300"
      >
        <FaWhatsapp size={32} />
      </a>
    </div>
  );
}

export default WhatsAppButton;
