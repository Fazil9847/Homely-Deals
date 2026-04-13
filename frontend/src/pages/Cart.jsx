import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const isOfferActive = (item, now = Date.now()) => {
  if (!item.offer?.isOffer) {
    return false;
  }

  if (!item.offer?.expiresAt) {
    return true;
  }

  const expiryTime = new Date(item.offer.expiresAt).getTime();

  if (Number.isNaN(expiryTime)) {
    return true;
  }

  return now < expiryTime;
};

const getItemPrice = (item, now = Date.now()) =>
  isOfferActive(item, now) ? item.offer.offerPrice : item.price;

const buildOrderLines = (cart) =>
  cart
    .filter((item) => item.qty > 0)
    .map((item) => {
    const unitPrice = item.currentPrice ?? getItemPrice(item);
    const subtotal = unitPrice * item.qty;

    return `${item.name}\nQty: ${item.qty} | Price: Rs.${unitPrice} | Total: Rs.${subtotal}`;
  });

function Cart({ cart, updateQty, removeFromCart, clearCart, phoneNumber }) {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());
  const [waLoading, setWaLoading] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const activeCartItems = cart.filter((item) => item.qty > 0);
  const total = cart.reduce(
    (sum, item) => sum + getItemPrice(item, now) * item.qty,
    0,
  );

  const orderLines = buildOrderLines(
    cart.map((item) => ({ ...item, currentPrice: getItemPrice(item, now) })),
  );
  const message = [
    "Hi,",
    "",
    "I want to order:",
    "",
    orderLines.length ? orderLines.join("\n\n") : "No items selected yet.",
    "",
    `Total Items: ${totalItems}`,
    `Grand Total: Rs.${total}`,
  ].join("\n");

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const handleWhatsAppOrder = () => {
  if (waLoading || totalItems <= 0) return;

  setWaLoading(true);

  try {
    window.open(whatsappLink, "_blank");
  } catch (error) {
    console.error(error);
  } finally {
    setTimeout(() => {
      setWaLoading(false);
    }, 900);
  }
};

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Shopping Cart
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Your cart
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review your items, adjust quantities, and send the order on WhatsApp.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Continue shopping
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
              CART
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add products to your cart and they will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
            <div className="space-y-4">
              {cart.map((item) => {
                const offerActive = isOfferActive(item, now);
                const unitPrice = getItemPrice(item, now);
                const subtotal = unitPrice * item.qty;

                return (
                  <div
                    key={item._id}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm"
                  >
                    <div className="flex flex-row gap-3 p-4 items-start sm:flex-row sm:items-center sm:p-5">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-24 sm:w-28">
  {item.image && (
    <img
      src={item.image}
      alt={item.name}
    className="h-full w-full object-cover object-center"
    />
  )}
</div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {item.name}
                            </h3>
                            {item.category && (
                              <p className="mt-1 text-sm text-slate-500">
                                {item.category}
                              </p>
                            )}
                            {offerActive && (
                              <div className="mt-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                Offer price active
                              </div>
                            )}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg font-semibold text-slate-900">
                              Rs.{subtotal}
                            </p>
                            <p className="text-sm text-slate-500">
                              Rs.{unitPrice} each
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                            <button
                              onClick={() => updateQty(item._id, item.qty - 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium text-slate-700 transition hover:bg-white"
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              -
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item._id, item.qty + 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium text-slate-700 transition hover:bg-white"
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-sm font-medium text-red-500 transition hover:text-red-600"
                          >
                            Remove item
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                  Order summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Total items</span>
                    <span className="font-medium text-slate-900">{totalItems}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Unique products</span>
                    <span className="font-medium text-slate-900">{activeCartItems.length}</span>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-slate-900">
                      Total
                    </span>
                    <span className="text-2xl font-semibold text-slate-900">
                      Rs.{total}
                    </span>
                  </div>
                </div>

       <button
  onClick={handleWhatsAppOrder}
  disabled={waLoading || totalItems <= 0}
  className={`mt-6 block w-full rounded-2xl px-5 py-3 text-center text-sm font-semibold text-white transition ${
    totalItems > 0
      ? "bg-green-500 hover:bg-green-600"
      : "bg-gray-300"
  } disabled:cursor-not-allowed disabled:opacity-70`}
>
  {waLoading
    ? "Preparing Order..."
    : "Send order on WhatsApp"}
</button>

                <button
                  onClick={clearCart}
                  className="mt-3 block w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-center text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Clear cart
                </button>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Your selected items and quantities will be pre-filled in the WhatsApp message.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
