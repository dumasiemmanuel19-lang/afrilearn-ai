// No user accounts in this version — Pro status is a verified flag stored
// on this device. Simple to ship, but it won't follow a user across
// devices/browsers. See README for the upgrade path to real accounts.

const PRO_KEY = "afrilearn_pro";

export function isProUser() {
  try {
    return localStorage.getItem(PRO_KEY) === "true";
  } catch {
    return false;
  }
}

function setProUser(value) {
  try {
    localStorage.setItem(PRO_KEY, value ? "true" : "false");
  } catch {
    /* ignore storage errors (e.g. private browsing) */
  }
}

const PRO_PRICE_GHS = Number(import.meta.env.VITE_PRO_PRICE_GHS || 20);
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

/**
 * Opens the Paystack checkout popup, then verifies the payment with our
 * own backend (never trust the client-side "success" callback alone —
 * anyone could fake it via dev tools).
 */
export function startProCheckout({ email, onSuccess, onError }) {
  if (!window.PaystackPop) {
    onError?.("Payment system didn't load. Check your connection and try again.");
    return;
  }
  if (!PAYSTACK_PUBLIC_KEY) {
    onError?.("Paystack isn't configured yet (missing VITE_PAYSTACK_PUBLIC_KEY).");
    return;
  }

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email || "guest@afrilearn.app",
    amount: PRO_PRICE_GHS * 100, // Paystack expects kobo/pesewas
    currency: "GHS",
    label: "AfriLearn AI — Pro (remove ads)",
    callback: (response) => {
      verifyPayment(response.reference)
        .then((ok) => {
          if (ok) {
            setProUser(true);
            onSuccess?.();
          } else {
            onError?.("Payment could not be verified. Contact support if you were charged.");
          }
        })
        .catch(() => onError?.("Payment could not be verified. Contact support if you were charged."));
    },
    onClose: () => {
      /* user closed the popup without paying — no-op */
    },
  });
  handler.openIframe();
}

async function verifyPayment(reference) {
  const res = await fetch("/.netlify/functions/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.verified === true;
}

export { PRO_PRICE_GHS };
