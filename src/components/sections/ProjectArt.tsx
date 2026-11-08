import type { CSSProperties } from "react";
import Image from "next/image";
import type { Project } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * A project's picture in three framings. Uses the project's screenshot when it
 * has one (full shot, zoomed-in detail, or inside a phone); otherwise
 * placeholder art built from its palette.
 */
export function ProjectArt({
  project,
  variant,
  className,
}: {
  project: Project;
  variant: "mobile" | "detail" | "cover";
  className?: string;
}) {
  const [a, b, c] = project.colors;
  const style = { "--a": a, "--b": b, "--c": c } as CSSProperties;
  const name = project.name.join(" ");
  // Phones show the tall full-page shot when there is one
  const src = (variant === "mobile" && project.fullPage) || project.image;
  const shot = src && (
    <Image
      src={src}
      alt=""
      fill
      sizes={variant === "mobile" ? "240px" : "(max-width: 700px) 100vw, 50vw"}
      className="art__shot"
    />
  );

  return (
    <div
      className={cn("art", `art--${variant}`, src && "art--shot", className)}
      style={style}
      aria-hidden="true"
    >
      {variant === "mobile" && (
        <div className="art__phone">
          <div className="art__notch" />
          <div className="art__screen">
            {shot || (
              <>
                <span className="art__title">{name}</span>
                <div className="art__card" />
                <div className="art__rows">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="art__pill" />
              </>
            )}
          </div>
        </div>
      )}
      {variant === "detail" &&
        (shot || (
          <div className="art__type">
            <span>{name}</span>
            <span>{project.platform}</span>
          </div>
        ))}
      {variant === "cover" && (
        <>
          {shot}
          <span className="art__cover-name">{name}</span>
        </>
      )}
    </div>
  );
}
