interface MarqueeProps {
  items: string[];
  speed?: number; // seconds for one full loop
}

export default function Marquee({ items, speed = 26 }: MarqueeProps) {
  return (
    <div className="bg-ink overflow-hidden flex items-center whitespace-nowrap">
      <div
        className="inline-flex animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="text-white px-7 py-3 text-xs uppercase tracking-widest text-paper before:content-['—'] before:mr-2.5 before:text-rust"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}