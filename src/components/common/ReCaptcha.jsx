import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const ReCaptcha = forwardRef(
  ({ siteKey, onVerify, onExpired, onError }, ref) => {
    const recaptchaRef = useRef(null);
    const widgetId = useRef(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.grecaptcha && widgetId.current !== null) {
          window.grecaptcha.reset(widgetId.current);
        }
      },
      execute: () => {
        if (window.grecaptcha && widgetId.current !== null) {
          window.grecaptcha.execute(widgetId.current);
        }
      },
    }));

    useEffect(() => {
      const loadRecaptcha = () => {
        if (window.grecaptcha && window.grecaptcha.render) {
          try {
            widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
              sitekey: siteKey,
              callback: onVerify,
              "expired-callback": onExpired,
              "error-callback": onError,
            });
          } catch (error) {
            console.error("ReCaptcha render error:", error);
          }
        }
      };

      // Check if script is already loaded
      if (window.grecaptcha) {
        loadRecaptcha();
      } else {
        // Load the reCAPTCHA script
        const script = document.createElement("script");
        script.src =
          "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
        script.async = true;
        script.defer = true;

        window.onRecaptchaLoad = () => {
          loadRecaptcha();
        };

        document.body.appendChild(script);

        return () => {
          // Cleanup
          if (widgetId.current !== null && window.grecaptcha) {
            try {
              window.grecaptcha.reset(widgetId.current);
            } catch (error) {
              console.error("ReCaptcha cleanup error:", error);
            }
          }
        };
      }
    }, [siteKey, onVerify, onExpired, onError]);

    return <div ref={recaptchaRef} className="flex justify-center"></div>;
  }
);

ReCaptcha.displayName = "ReCaptcha";

export default ReCaptcha;
