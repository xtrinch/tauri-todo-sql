import { useMutation } from "@tanstack/react-query";
import { getDatabase } from "./database";

export const useUndo = (onSuccess: () => void) => {
  return useMutation({
    onSuccess: onSuccess,
    mutationFn: async () => {
      const db = await getDatabase();

      // Fetch the most recent undo log entry
      const lastUndo: { seq: number; sql: string }[] = await db.select(
        "SELECT seq, sql FROM undolog ORDER BY seq DESC LIMIT 1"
      );

      if (lastUndo.length === 0) {
        throw new Error("No actions to undo");
      }

      const { seq, sql } = lastUndo[0];

      // Execute the undo SQL
      await db.execute(sql);

      // Remove the undo log entry
      await db.execute("DELETE FROM undolog WHERE seq = $1", [seq]);
      await db.execute(
        "DELETE FROM undolog WHERE seq = (SELECT MAX(seq) FROM undolog)"
      );
      return { seq, sql };
    },
  });
};

export const useRedo = () => {
  return useMutation({
    mutationFn: async () => {
      const db = await getDatabase();

      // Fetch the most recent undo log entry
      const lastRedo: { seq: number; sql: string }[] = await db.select(
        "SELECT seq, sql FROM redolog ORDER BY seq DESC LIMIT 1"
      );

      if (lastRedo.length === 0) {
        throw new Error("No actions to undo");
      }

      const { seq, sql } = lastRedo[0];

      // Execute the undo SQL
      await db.execute(sql);

      // Remove the undo log entry
      await db.execute("DELETE FROM redolog WHERE seq = $1", [seq]);

      return { seq, sql };
    },
  });
};
