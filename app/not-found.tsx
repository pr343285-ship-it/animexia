import Link from "next/link";

export default function NotFound() {
  return <main className="loading-screen"><span className="loading-mark">F</span><span>That frame is missing.</span><Link className="button button--light" href="/">Return home</Link></main>;
}
