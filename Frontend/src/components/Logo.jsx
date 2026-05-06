import { useState } from "react";
import logo from "../assets/brainbyte-logo-removebg-preview.png";

export const APP_NAME = "BrainByte";

function Logo({ size = "default", showText = false, subtitle, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const classes = ["brand-logo", `brand-logo-${size}`, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <span className="brand-logo-frame">
        {imageFailed ? (
          <span className="brand-logo-fallback" aria-label={`${APP_NAME} Logo`}>
            B
          </span>
        ) : (
          <img
            src={logo}
            alt={`${APP_NAME} Logo`}
            loading="eager"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )}
      </span>
      {showText && (
        <div className="brand-logo-copy">
          <h1>{APP_NAME}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

export default Logo;
