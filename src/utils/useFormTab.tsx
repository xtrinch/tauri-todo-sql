import { useCallback, useEffect } from "react";

export default function useFormTab() {
  const keyDownHandler = useCallback((event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputTarget = event.currentTarget as HTMLInputElement;

      const fields: HTMLInputElement[] =
        Array.from(inputTarget.querySelectorAll("input")) || [];
      const position = fields.indexOf(event.target as HTMLInputElement);
      fields[position + 1] && fields[position + 1].focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);
}
