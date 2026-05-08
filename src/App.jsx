import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0f1a",
  card: "#111827",
  cardHover: "#1a2332",
  border: "#1e2d3d",
  accent: "#3b82f6",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#10b981",
  greenBg: "rgba(16,185,129,0.12)",
  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redBg: "rgba(239,68,68,0.12)",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  routeBlue: "#60a5fa",
};

const parkingData = [
  { id: 1, name: "강남역 공영주차장", distance: "850m", walkTime: "3분", driveTime: "6분", total: 320, available: 42, predicted: 35, score: 94, fee: "3,000원/시간", type: "공영", lat: 37.498, lng: 127.028 },
  { id: 2, name: "역삼 센트럴 주차장", distance: "1.2km", walkTime: "5분", driveTime: "8분", total: 200, available: 18, predicted: 12, score: 78, fee: "4,000원/시간", type: "민영", lat: 37.501, lng: 127.035 },
  { id: 3, name: "테헤란로 지하주차장", distance: "600m", walkTime: "2분", driveTime: "4분", total: 150, available: 3, predicted: 0, score: 15, fee: "3,500원/시간", type: "공영", lat: 37.505, lng: 127.032 },
  { id: 4, name: "삼성동 공영주차장", distance: "1.8km", walkTime: "8분", driveTime: "11분", total: 450, available: 87, predicted: 72, score: 82, fee: "2,500원/시간", type: "공영", lat: 37.510, lng: 127.045 },
  { id: 5, name: "선릉역 부설주차장", distance: "1.5km", walkTime: "6분", driveTime: "9분", total: 180, available: 31, predicted: 25, score: 71, fee: "3,500원/시간", type: "부설", lat: 37.504, lng: 127.049 },
];

function getStatusColor(predicted, total) {
  const ratio = predicted / total;
  if (ratio <= 0.03) return { color: COLORS.red, bg: COLORS.redBg, label: "만차 임박" };
  if (ratio <= 0.15) return { color: COLORS.amber, bg: COLORS.amberBg, label: "혼잡" };
  return { color: COLORS.green, bg: COLORS.greenBg, label: "여유" };
}

function MapView({ selectedParking }) {
  const points = [
    { x: 180, y: 340, label: "현위치", isCurrent: true },
    { x: 320, y: 120, label: "목적지", isDest: true },
    ...parkingData.map((p, i) => ({
      x: 100 + ((p.lng - 127.025) * 8000),
      y: 400 - ((p.lat - 37.495) * 8000),
      label: `P${i + 1}`,
      parking: p,
    })),
  ];

  const selected = parkingData.find(p => p.id === selectedParking) || parkingData[0];
  const selPoint = points.find(pt => pt.parking?.id === selected.id);

  return (
    <svg viewBox="0 0 500 420" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="roadH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e293b" stopOpacity="0" />
          <stop offset="20%" stopColor="#1e293b" />
          <stop offset="80%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="roadV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" stopOpacity="0" />
          <stop offset="20%" stopColor="#1e293b" />
          <stop offset="80%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {[80, 180, 280, 380].map(y => (
        <rect key={`h${y}`} x="0" y={y - 4} width="500" height="8" fill="url(#roadH)" rx="2" opacity="0.6" />
      ))}
      {[100, 200, 320, 420].map(x => (
        <rect key={`v${x}`} x={x - 4} y="0" width="8" height="420" fill="url(#roadV)" rx="2" opacity="0.6" />
      ))}

      {selPoint && (
        <path
          d={`M180,340 C180,260 ${selPoint.x},200 ${selPoint.x},${selPoint.y}`}
          fill="none"
          stroke={COLORS.routeBlue}
          strokeWidth="3"
          strokeDasharray="8 4"
          opacity="0.8"
          filter="url(#glow)"
        >
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1s" repeatCount="indefinite" />
        </path>
      )}
      <path
        d={`M180,340 C220,280 280,180 320,120`}
        fill="none"
        stroke={COLORS.accent}
        strokeWidth="2.5"
        strokeDasharray="6 3"
        opacity="0.5"
      />

      {points.filter(p => p.parking).map((p, i) => {
        const status = getStatusColor(p.parking.predicted, p.parking.total);
        const isSelected = p.parking.id === selectedParking;
        return (
          <g key={i}>
            {isSelected && <circle cx={p.x} cy={p.y} r="18" fill={status.color} opacity="0.15">
              <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite" />
            </circle>}
            <circle cx={p.x} cy={p.y} r="12" fill={COLORS.card} stroke={status.color} strokeWidth={isSelected ? 2.5 : 1.5} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central" fill={status.color} fontSize="9" fontWeight="600" fontFamily="monospace">{p.label}</text>
            <text x={p.x} y={p.y - 18} textAnchor="middle" fill={COLORS.textMuted} fontSize="8" fontFamily="sans-serif">{p.parking.name.split(" ")[0]}</text>
          </g>
        );
      })}

      <g>
        <circle cx="180" cy="340" r="8" fill={COLORS.accent} opacity="0.3">
          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="340" r="6" fill={COLORS.accent} />
        <circle cx="180" cy="340" r="2.5" fill="#fff" />
        <text x="180" y="360" textAnchor="middle" fill={COLORS.accent} fontSize="9" fontWeight="600" fontFamily="sans-serif">현위치</text>
      </g>

      <g>
        <rect x="308" y="104" width="24" height="30" rx="12" fill={COLORS.red} opacity="0.9" />
        <circle cx="320" cy="114" r="4" fill="#fff" />
        <polygon points="320,134 316,124 324,124" fill={COLORS.red} />
        <text x="320" y="100" textAnchor="middle" fill={COLORS.red} fontSize="9" fontWeight="600" fontFamily="sans-serif">목적지</text>
      </g>
    </svg>
  );
}

function ScoreBar({ score }) {
  const w = Math.max(score, 5);
  const color = score >= 70 ? COLORS.green : score >= 40 ? COLORS.amber : COLORS.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace", minWidth: 28, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function PredictionChart({ available, predicted, total }) {
  const bars = [
    { label: "현재", value: available, max: total, color: COLORS.green },
    { label: "10분 후", value: predicted, max: total, color: predicted / total < 0.05 ? COLORS.red : COLORS.amber },
  ];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 40 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1 }}>
          <span style={{ fontSize: 11, color: b.color, fontWeight: 600, fontFamily: "monospace" }}>{b.value}면</span>
          <div style={{ width: "100%", height: 20, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(b.value / b.max) * 100}%`, height: "100%", background: b.color, borderRadius: 3, opacity: 0.7, transition: "width 0.5s" }} />
          </div>
          <span style={{ fontSize: 9, color: COLORS.textDim }}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ParkCastDemo() {
  const [destination, setDestination] = useState("강남역 2번 출구");
  const [walkPref, setWalkPref] = useState("5");
  const [selectedParking, setSelectedParking] = useState(1);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const sorted = [...parkingData].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const alternatives = sorted.slice(1).filter(p => p.score > 20);

  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      minHeight: "100vh",
      fontFamily: "'Pretendard', -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: `1px solid ${COLORS.border}`,
        background: "rgba(17,24,39,0.8)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>P</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>ParkCast</div>
            <div style={{ fontSize: 10, color: COLORS.textDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>AI 주차 수요 예측 시스템</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: COLORS.greenBg, borderRadius: 6, border: `1px solid rgba(16,185,129,0.2)` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
            <span style={{ fontSize: 11, color: COLORS.green, fontWeight: 600 }}>LIVE</span>
          </div>
          <span style={{ fontSize: 12, color: COLORS.textDim, fontFamily: "monospace" }}>
            {time.toLocaleTimeString("ko-KR")}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{
          flex: "0 0 55%",
          position: "relative",
          borderRight: `1px solid ${COLORS.border}`,
          background: `radial-gradient(ellipse at 30% 70%, rgba(59,130,246,0.04) 0%, transparent 60%)`,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, letterSpacing: "0.04em" }}>실시간 주차장 지도</span>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { color: COLORS.green, label: "여유" },
                { color: COLORS.amber, label: "혼잡" },
                { color: COLORS.red, label: "만차" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, opacity: 0.8 }} />
                  <span style={{ fontSize: 10, color: COLORS.textDim }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, padding: "0 12px 12px" }}>
            <MapView selectedParking={selectedParking} />
          </div>

          <div style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            background: "rgba(17,24,39,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            padding: "10px 14px",
            display: "flex",
            gap: 20,
          }}>
            {[
              { label: "총 주차장", value: "5개소", icon: "▦" },
              { label: "총 빈자리", value: `${parkingData.reduce((s, p) => s + p.available, 0)}면`, icon: "◉" },
              { label: "10분 후 예측", value: `${parkingData.reduce((s, p) => s + p.predicted, 0)}면`, icon: "◎" },
              { label: "분산 효율", value: "78%", icon: "⬡" },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: "monospace" }}>{s.value}</div>
                <div style={{ fontSize: 9, color: COLORS.textDim, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          flex: "0 0 45%",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}>
          <div style={{
            padding: 16,
            borderBottom: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 10, letterSpacing: "0.04em" }}>목적지 및 설정</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                    color: COLORS.text,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="목적지 입력"
                />
              </div>
              <select
                value={walkPref}
                onChange={e => setWalkPref(e.target.value)}
                style={{
                  padding: "8px 10px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  color: COLORS.text,
                  fontSize: 12,
                }}
              >
                <option value="3">도보 3분</option>
                <option value="5">도보 5분</option>
                <option value="10">도보 10분</option>
              </select>
            </div>

            <div style={{
              padding: 14,
              background: COLORS.accentGlow,
              border: `1px solid rgba(59,130,246,0.25)`,
              borderRadius: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>최적 추천 주차장</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{best.name}</div>
                </div>
                <div style={{
                  padding: "3px 10px",
                  background: `linear-gradient(135deg, ${COLORS.accent}, #8b5cf6)`,
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}>추천 {best.score}점</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[
                  { label: "거리", value: best.distance },
                  { label: "차량 이동", value: best.driveTime },
                  { label: "도보", value: best.walkTime },
                ].map(d => (
                  <div key={d.label} style={{ padding: "6px 8px", background: "rgba(0,0,0,0.2)", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{d.value}</div>
                    <div style={{ fontSize: 9, color: COLORS.textDim }}>{d.label}</div>
                  </div>
                ))}
              </div>

              <PredictionChart available={best.available} predicted={best.predicted} total={best.total} />

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => setSelectedParking(best.id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: COLORS.accent,
                    border: "none",
                    borderRadius: 6,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >예약하기</button>
                <button
                  onClick={() => setSelectedParking(best.id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: "transparent",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                    color: COLORS.textMuted,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >경로 안내</button>
              </div>
            </div>
          </div>

          <div style={{ padding: 16, flex: 1, overflow: "auto" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 10, letterSpacing: "0.04em" }}>
              대안 주차장 ({alternatives.length}개)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alternatives.map(p => {
                const status = getStatusColor(p.predicted, p.total);
                const isSelected = p.id === selectedParking;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParking(p.id)}
                    style={{
                      padding: 12,
                      background: isSelected ? COLORS.cardHover : COLORS.card,
                      border: `1px solid ${isSelected ? COLORS.accent : COLORS.border}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                        <span style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          background: status.bg,
                          color: status.color,
                          borderRadius: 4,
                          fontWeight: 600,
                        }}>{status.label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: COLORS.textDim }}>{p.type} · {p.fee}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 6 }}>
                      {[
                        { label: "거리", value: p.distance },
                        { label: "차량", value: p.driveTime },
                        { label: "도보", value: p.walkTime },
                        { label: "현재", value: `${p.available}면` },
                        { label: "10분후", value: `${p.predicted}면` },
                      ].map(d => (
                        <div key={d.label} style={{ fontSize: 11 }}>
                          <span style={{ color: COLORS.textDim }}>{d.label} </span>
                          <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                    <ScoreBar score={p.score} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
