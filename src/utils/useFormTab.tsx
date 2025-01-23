import { useCallback, useEffect } from "react";

export default function useFormTab() {
  const keyDownHandler = useCallback((event: KeyboardEvent) => {
    // stackoverflow.com/a/68785699/2402929
    if (event.key === "Enter") {
      const fields: HTMLInputElement[] =
        // @ts-ignore
        Array.from(event.currentTarget!.querySelectorAll("input")) || [];
      const position = fields.indexOf(event.target as HTMLInputElement);
      fields[position + 1] && fields[position + 1].focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);
    return () => document.removeEventListener("keydown", keyDownHandler);
  }, []);
}
