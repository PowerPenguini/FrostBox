// export function ErrorText({ text }) {
//   return <p className="font-medium text-red-600 text-sm">{text}</p>;
// }

import { useEffect, useRef } from "react";

export function ErrorText({ text }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  return (
    <div ref={ref} className="py-4">
      <div className="bg-destructive/10 p-3 border border-destructive/20 rounded-lg text-destructive text-sm">
        {text}
      </div>
    </div>
  );
}
