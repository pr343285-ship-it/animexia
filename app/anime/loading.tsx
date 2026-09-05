import { Frame } from "@/components/frame";

export default function Loading() {
  return (
    <Frame active="Anime">
      <section className="section page-section" aria-live="polite" aria-busy="true">
        <span className="section-label">ANIMEXIA catalog</span>
        <h1 className="page-title">Loading anime...</h1>
      </section>
    </Frame>
  );
}
