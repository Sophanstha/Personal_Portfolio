import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  /** Cursor influence radius in px */
  radius?: number;
  /** Letters rise in on page enter */
  enter?: boolean;
  as?: "span" | "div";
};

/** A single line of display text whose letters stretch toward the cursor. */
export function KineticLine({ text, className, radius = 300, enter = false, as: Tag = "span" }: Props) {
  return (
    <Tag className={cn("k-line", className)} data-kline="">
      <span className="sr-only">{text}</span>
      <span className="k-inner" data-kinner="" aria-hidden="true">
        {Array.from(text).map((ch, i) =>
          ch === " " ? (
            <span key={i} className="k-space" />
          ) : (
            <span key={i} className="k-letter" data-k={radius} data-in={enter ? "" : undefined}>
              {ch}
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
