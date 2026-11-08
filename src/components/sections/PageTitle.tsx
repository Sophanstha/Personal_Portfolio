import { KineticLine } from "@/components/motion/KineticLine";
import { cn } from "@/lib/utils";

/** Big uppercase page heading: letters rise in, stretch near the cursor and fit the width. */
export function PageTitle({
  text,
  size = "large",
  intro,
}: {
  text: string;
  size?: "large" | "medium" | "small";
  /** Optional muted line under the title (fades up after the letters) */
  intro?: string;
}) {
  return (
    <div className={cn("page-title", `page-title--${size}`, intro && "page-title--intro")}>
      <h1 className="page-title__title" data-fit="">
        <KineticLine text={text} className="page-title__line" enter radius={360} />
      </h1>
      {intro && (
        <p className="page-title__intro" data-reveal="">
          {intro}
        </p>
      )}
    </div>
  );
}
