export function Marquee({ items }: { items: string[] }) {
  const track = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {track.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item} <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
