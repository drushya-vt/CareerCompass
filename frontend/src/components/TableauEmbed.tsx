"use client";
import { useEffect, useRef } from "react";

interface TableauEmbedProps {
  id: string;
  name: string;
  className?: string;
}

export default function TableauEmbed({
  id,
  name,
  className = "",
}: TableauEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    script.async = true;
    if (ref.current) {
      ref.current.appendChild(script);
    }
  }, []);

  return (
    <div
      id={id}
      className={`w-full h-[85vh] md:h-[70vh] ${className}`}
      ref={ref}
    >
      <noscript>
        <a href="#">
          <img
            alt="Career Compass Dashboard"
            src={`https://public.tableau.com/static/images/${name}/1_rss.png`}
            style={{ border: "none", width: "100%" }}
          />
        </a>
      </noscript>

      <object className="tableauViz" style={{ width: "100%", height: "100%" }}>
        <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
        <param name="embed_code_version" value="3" />
        <param name="site_root" value="" />
        <param name="name" value={name} />
        <param name="tabs" value="no" />
        <param name="toolbar" value="yes" />
        <param
          name="static_image"
          value={`https://public.tableau.com/static/images/${name}/1.png`}
        />
        <param name="animate_transition" value="yes" />
        <param name="display_static_image" value="yes" />
        <param name="display_spinner" value="yes" />
        <param name="display_overlay" value="yes" />
        <param name="display_count" value="yes" />
        <param name="language" value="en-US" />
      </object>
    </div>
  );
}
