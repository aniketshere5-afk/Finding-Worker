export default function Stars({ value = 0 }) {
  const n = Math.round(Number(value) || 0);
  return <span className="stars">{"★".repeat(n)}{"☆".repeat(Math.max(0, 5 - n))}</span>;
}
