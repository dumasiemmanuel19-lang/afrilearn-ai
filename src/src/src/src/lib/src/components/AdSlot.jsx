import React, { useEffect, useRef } from "react";

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;

/**
 * Renders a Google AdSense unit. Renders nothing if the user is Pro,
 * or if AdSense isn't configured (so the app still works before you've
 * been approved / added your IDs).
 */
export default function AdSlot({ slotId, isPro, format = "auto", className = "" }) {
  const ref = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (isPro || !CLIENT_ID || !slotId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense script may not have loaded yet, or ad blocker present */
    }
  }, [isPro, slotId]);

  if (isPro || !CLIENT_ID || !slotId) return null;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <p className="al-mono text-[9px] uppercase tracking-widest text-[#A39B84] mb-1 text-center">
        Advertisement
      </p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
