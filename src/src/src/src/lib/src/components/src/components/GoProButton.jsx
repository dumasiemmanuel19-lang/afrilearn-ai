import React, { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { startProCheckout, PRO_PRICE_GHS } from "../lib/pro.js";

export default function GoProButton({ isPro, onUpgraded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isPro) {
    return (
      <span className="al-mono inline-flex items-center gap-1.5 border-2 border-[#8A6425] text-[#8A6425] rounded-sm px-2 py-0.5 text-xs tracking-widest uppercase">
        <Check className="w-3.5 h-3.5" />
        Pro
      </span>
    );
  }

  function handleClick() {
    setError("");
    setLoading(true);
    startProCheckout({
      onSuccess: () => {
        setLoading(false);
        onUpgraded?.();
      },
      onError: (msg) => {
        setLoading(false);
        setError(msg);
      },
    });
    // Popup is async and modal — stop the spinner once it's had a moment
    // to open so the button isn't stuck if the user just closes it.
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="al-mono flex items-center gap-1.5 border-2 border-[#A7332B] text-[#A7332B] rounded-sm px-2.5 py-1 text-xs uppercase tracking-widest hover:bg-[#A7332B] hover:text-[#F7F4EC] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        Go Pro — GHS {PRO_PRICE_GHS}
      </button>
      {error && (
        <p className="al-body text-[11px] text-[#A7332B] max-w-[180px] text-right">
          {error}
        </p>
      )}
    </div>
  );
}
