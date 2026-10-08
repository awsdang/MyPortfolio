/** Drifting colour fields + an architect's plan drawn in hairlines (the personal touch). */
export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <svg className="plan" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeWidth="1">
        {/* structural grid */}
        <g strokeDasharray="14 6 2 6" opacity=".7">
          {[160, 420, 680, 940, 1200].map((x) => (
            <line key={x} x1={x} y1="86" x2={x} y2="820" />
          ))}
          {[200, 440, 680].map((y) => (
            <line key={y} x1="96" y1={y} x2="1264" y2={y} />
          ))}
        </g>
        <g>
          {["A", "B", "C", "D", "E"].map((l, i) => (
            <g key={l}>
              <circle cx={160 + i * 260} cy="64" r="17" />
              <text x={160 + i * 260} y="69" textAnchor="middle" fontSize="14" fill="currentColor" stroke="none" fontFamily="ui-monospace,Menlo,monospace">{l}</text>
            </g>
          ))}
          {["1", "2", "3"].map((l, i) => (
            <g key={l}>
              <circle cx="76" cy={200 + i * 240} r="17" />
              <text x="76" y={205 + i * 240} textAnchor="middle" fontSize="14" fill="currentColor" stroke="none" fontFamily="ui-monospace,Menlo,monospace">{l}</text>
            </g>
          ))}
        </g>
        {/* walls (double line) */}
        <g strokeWidth="1.6">
          <path d="M160 200H940V680H160Z" />
          <path d="M170 210H930V670H170Z" opacity=".7" />
          <path d="M420 200V440M430 210V430M420 440H680M420 450H680" />
          <path d="M680 440V680M670 450V670" />
          <path d="M160 440H300M160 450H300" />
        </g>
        {/* doors + windows */}
        <g>
          <path d="M300 440a62 62 0 0 1 62 -62" />
          <path d="M300 440V378" />
          <path d="M680 560a60 60 0 0 0 -60 -60" />
          <path d="M680 560V500" />
          <path d="M540 200v10M580 200v10M620 200v10M660 200v10" strokeWidth="3" />
          <path d="M160 300h10M160 340h10M160 380h10" strokeWidth="3" />
          <path d="M930 520h10M930 560h10M930 600h10" strokeWidth="3" />
        </g>
        {/* columns */}
        <g fill="currentColor" stroke="none" opacity=".55">
          {[160, 420, 680, 940].flatMap((x) => [200, 440, 680].map((y) => <rect key={`${x}-${y}`} x={x - 6} y={y - 6} width="12" height="12" />))}
        </g>
        {/* stair */}
        <g opacity=".8">
          <path d="M720 240h160v150H720Z" />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M720 ${256 + i * 15}h160`} />
          ))}
          <path d="M800 392v-132m-8 14l8-14 8 14" />
        </g>
        {/* dimensions */}
        <g fontFamily="ui-monospace,Menlo,monospace" fontSize="12" opacity=".85">
          <path d="M160 740H940M160 730v20M940 730v20M420 735v10M680 735v10" />
          <text x="550" y="732" textAnchor="middle" fill="currentColor" stroke="none">7800</text>
          <path d="M1000 200V680M990 200h20M990 680h20" />
          <text x="1018" y="446" fill="currentColor" stroke="none" transform="rotate(90 1018 446)" textAnchor="middle">4800</text>
        </g>
        {/* north arrow + scale */}
        <g transform="translate(1150 130)" opacity=".85">
          <circle r="34" />
          <path d="M0 -26L9 14L0 6L-9 14Z" fill="currentColor" />
          <text y="-42" textAnchor="middle" fontSize="12" fill="currentColor" stroke="none" fontFamily="ui-monospace,Menlo,monospace">N</text>
        </g>
        <g transform="translate(1030 780)" fontFamily="ui-monospace,Menlo,monospace" fontSize="11" opacity=".8">
          <path d="M0 0h200M0 -5v10M50 -5v10M100 -5v10M150 -5v10M200 -5v10" />
          <text x="0" y="22" fill="currentColor" stroke="none">0</text>
          <text x="100" y="22" fill="currentColor" stroke="none" textAnchor="middle">5m</text>
          <text x="200" y="22" fill="currentColor" stroke="none" textAnchor="end">10m</text>
        </g>
        {/* section hatch */}
        <g opacity=".45">
          {Array.from({ length: 18 }).map((_, i) => (
            <path key={i} d={`M${1090 + i * 9} 640l-30 40`} />
          ))}
        </g>
      </svg>
      <div className="grain" />
    </div>
  );
}
