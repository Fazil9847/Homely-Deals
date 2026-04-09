function Footer({ settings }) {
  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow text-center">
      <h3 className="font-semibold text-lg">
        {settings?.shopName}
      </h3>

      <p className="text-gray-500">{settings?.location}</p>
      <p className="text-gray-500">{settings?.phone}</p>

      <p className="text-sm text-gray-400 mt-2">
        © {new Date().getFullYear()} All rights reserved
      </p>
    </div>
  );
}

export default Footer;

