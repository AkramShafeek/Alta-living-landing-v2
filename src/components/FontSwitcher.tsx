import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FONT_SETS = ["default", "editorial", "brutalist", "minimal"] as const;
type FontSet = (typeof FONT_SETS)[number];

export function FontSwitcher() {
  const [font, setFont] = useState<FontSet>(
    () => (localStorage.getItem("dev-font") as FontSet) || "default"
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-font",
      font === "default" ? "" : font
    );
    localStorage.setItem("dev-font", font);
  }, [font]);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="border rounded-full border-black">
      <Select value={font} onValueChange={(v) => setFont(v as FontSet)}>
        <SelectTrigger className="w-40 rounded-full">
          <SelectValue placeholder="Font set" />
        </SelectTrigger>
        <SelectContent position="popper">
          {FONT_SETS.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}