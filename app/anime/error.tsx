"use client";

import { useEffect } from "react";
import { Frame } from "@/components/frame";

export default function AnimeError({ reset }: { reset: () => void }) {
  useEffect(() => {
    console.error("Anime catalog failed to load.");
  }, []);

  return (
    <Frame active="Anime">
      <section className="section page-section" role="alert">
        <span className="section-label">ANIMEXIA catalog</span>
        <h1 className="page-title">Anime is temporarily unavailable.</h1>
        <button className="button button--light" type="button" onClick={reset}>Try again</button>
      </section>
    </Frame>
  );
}
