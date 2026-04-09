import { FaFacebookF, FaInstagram, FaLink, FaWhatsapp } from "react-icons/fa";
import { FiMapPin, FiPhone } from "react-icons/fi";

const footerLinks = (settings) =>
  [
    {
      label: "Google Maps",
      href: settings?.mapLink,
      icon: FiMapPin,
    },
    {
      label: "Instagram",
      href: settings?.instagram,
      icon: FaInstagram,
    },
    {
      label: "Facebook",
      href: settings?.facebook,
      icon: FaFacebookF,
    },
    {
      label: "Other",
      href: settings?.otherLink,
      icon: FaLink,
    },
  ].filter((item) => item.href);

const normalizePhone = (phone = "") => phone.replace(/[^\d]/g, "");

function Footer({ settings }) {
  const links = footerLinks(settings);
  const whatsappPhone = normalizePhone(settings?.phone);
  const whatsappLink = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        "Hi, I would like to know more about your products.",
      )}`
    : "";

  return (
    <footer className="mt-12 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.18),_transparent_28%)] px-6 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Homly Deals
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {settings?.shopName || "HOMLY DEALS"}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Reach out for product enquiries, store location, and direct updates
              through social channels.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {settings?.location && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-white/10 p-2 text-slate-100">
                      <FiMapPin className="text-base" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Location</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {settings.location}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {settings?.phone && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-white/10 p-2 text-slate-100">
                      <FiPhone className="text-base" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Phone</p>
                      <a
                        href={`tel:${settings.phone}`}
                        className="mt-1 block text-sm leading-6 text-slate-300 transition hover:text-white"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Quick Connect</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use these shortcuts to reach the owner directly.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition hover:scale-[1.02]"
                  >
                    <FaWhatsapp className="text-base" />
                    WhatsApp
                  </a>
                )}

                {links.map((link) => {
                  const Icon = link.icon;

                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/12"
                    >
                      <Icon className="text-sm" />
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} All rights reserved</p>
          <p>Designed for smooth furniture enquiries and direct contact.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
