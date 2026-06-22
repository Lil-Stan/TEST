import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const ALL_CATEGORIES = [
  { name: "Science", abbr: "SCI", questions: [
    { q: "What planet is known as the Red Planet?", o: ["Venus", "Mars", "Jupiter"], a: 1 },
    { q: "What gas do plants absorb from the atmosphere?", o: ["Oxygen", "Nitrogen", "Carbon dioxide"], a: 2 },
    { q: "What is the chemical symbol for gold?", o: ["Au", "Ag", "Go"], a: 0 },
    { q: "What type of bond involves the sharing of electrons?", o: ["Ionic", "Covalent", "Metallic"], a: 1 },
    { q: "What subatomic particle has no electric charge?", o: ["Proton", "Electron", "Neutron"], a: 2 },
  ]},
  { name: "History", abbr: "HIST", questions: [
    { q: "Who was the first president of the United States?", o: ["John Adams", "George Washington", "Thomas Jefferson"], a: 1 },
    { q: "In what year did World War II end?", o: ["1943", "1945", "1947"], a: 1 },
    { q: "The ancient city of Rome was built on how many hills?", o: ["Five", "Seven", "Nine"], a: 1 },
    { q: "Who was the primary author of the Declaration of Independence?", o: ["John Adams", "Benjamin Franklin", "Thomas Jefferson"], a: 2 },
    { q: "The Magna Carta was signed in which year?", o: ["1066", "1215", "1492"], a: 1 },
  ]},
  { name: "Geography", abbr: "GEO", questions: [
    { q: "What is the largest ocean on Earth?", o: ["Atlantic", "Indian", "Pacific"], a: 2 },
    { q: "What is the capital of Australia?", o: ["Sydney", "Melbourne", "Canberra"], a: 2 },
    { q: "What is the longest river in Africa?", o: ["Congo", "Nile", "Niger"], a: 1 },
    { q: "What desert is the largest hot desert in the world?", o: ["Gobi", "Sahara", "Arabian"], a: 1 },
    { q: "Which country spans the most time zones?", o: ["Russia", "United States", "France"], a: 2 },
  ]},
  { name: "Literature", abbr: "LIT", questions: [
    { q: "Who wrote Romeo and Juliet?", o: ["Charles Dickens", "William Shakespeare", "Jane Austen"], a: 1 },
    { q: "What is the name of Harry Potter's school?", o: ["Hogwarts", "Narnia", "Camelot"], a: 0 },
    { q: "Who wrote the dystopian novel 1984?", o: ["George Orwell", "Aldous Huxley", "Ray Bradbury"], a: 0 },
    { q: 'What novel begins with "Call me Ishmael"?', o: ["The Great Gatsby", "Moby-Dick", "Don Quixote"], a: 1 },
    { q: "Who wrote The Canterbury Tales?", o: ["Geoffrey Chaucer", "John Milton", "Edmund Spenser"], a: 0 },
  ]},
  { name: "Music", abbr: "MUS", questions: [
    { q: "How many strings does a standard guitar have?", o: ["Four", "Six", "Eight"], a: 1 },
    { q: "What instrument has 88 keys?", o: ["Organ", "Piano", "Accordion"], a: 1 },
    { q: "What musical term means gradually getting louder?", o: ["Forte", "Crescendo", "Allegro"], a: 1 },
    { q: 'Which Beatle was known as "the quiet Beatle"?', o: ["Ringo Starr", "George Harrison", "Paul McCartney"], a: 1 },
    { q: "A piece with no sharps or flats is in what key?", o: ["C major", "G major", "D major"], a: 0 },
  ]},
  { name: "Sports", abbr: "SPRT", questions: [
    { q: "How many players per side are on a basketball court?", o: ["4", "5", "6"], a: 1 },
    { q: "Which country has won the most FIFA World Cup titles?", o: ["Germany", "Argentina", "Brazil"], a: 2 },
    { q: "How many holes are in a standard round of golf?", o: ["9", "18", "36"], a: 1 },
    { q: "Which Grand Slam tennis event is played on clay?", o: ["Australian Open", "French Open", "Wimbledon"], a: 1 },
    { q: "In what year were the first modern Olympic Games held?", o: ["1896", "1900", "1912"], a: 0 },
  ]},
  { name: "Technology", abbr: "TECH", questions: [
    { q: 'What does "CPU" stand for?', o: ["Central Processing Unit", "Computer Personal Unit", "Central Power Unit"], a: 0 },
    { q: "Who co-founded Apple Computer with Steve Jobs?", o: ["Bill Gates", "Steve Wozniak", "Tim Cook"], a: 1 },
    { q: "What programming language is called the language of the web?", o: ["Python", "JavaScript", "C++"], a: 1 },
    { q: 'What does "HTTP" stand for?', o: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "HyperText Transmission Process"], a: 0 },
    { q: "In what year was the first iPhone released?", o: ["2005", "2007", "2009"], a: 1 },
  ]},
  { name: "Movies", abbr: "FILM", questions: [
    { q: "What is the fictional kingdom in Frozen?", o: ["Arendelle", "Genovia", "Narnia"], a: 0 },
    { q: "Who directed Jurassic Park?", o: ["James Cameron", "Steven Spielberg", "George Lucas"], a: 1 },
    { q: "What TV show features a character named Walter White?", o: ["The Sopranos", "Breaking Bad", "Dexter"], a: 1 },
    { q: 'What 1994 film says "Life is like a box of chocolates"?', o: ["Forrest Gump", "Shawshank Redemption", "Pulp Fiction"], a: 0 },
    { q: "Who played The Joker in The Dark Knight?", o: ["Jack Nicholson", "Joaquin Phoenix", "Heath Ledger"], a: 2 },
  ]},
];

const POINTS_R1 = [200, 400, 600, 800, 1000];
const POINTS_R2 = [400, 800, 1200, 1600, 2000];
const SECTOR_COUNT = 11;
const SECTOR_DEG = 360 / SECTOR_COUNT;
const CAT_COLORS = ["#3b82f6","#06b6d4","#a855f7","#ec4899","#f97316","#14b8a6"];
const SPECIAL = {
  FREE_SPIN:  { label: "Free spin",  abbr: "FREE", color: "#eab308" },
  LOSE_TURN:  { label: "Lose a turn", abbr: "LOSE", color: "#6b7280" },
  BANKRUPT:   { label: "Bankrupt",   abbr: "BUST", color: "#dc2626" },
  PLAYER_CH:  { label: "Player's choice", abbr: "PICK", color: "#22c55e" },
  OPPONENT_CH:{ label: "Opponents' choice", abbr: "OPP", color: "#8b5cf6" },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSectors(cats) {
  const items = cats.map((c, i) => ({ type: "CAT", catIdx: i, label: c.abbr, color: CAT_COLORS[i] }));
  Object.entries(SPECIAL).forEach(([k, v]) => items.push({ type: k, label: v.abbr, color: v.color }));
  return shuffle(items);
}

function sectorPath(cx, cy, r, i) {
  const s = ((i * SECTOR_DEG - 90) * Math.PI) / 180;
  const e = (((i + 1) * SECTOR_DEG - 90) * Math.PI) / 180;
  return `M${cx},${cy} L${cx + r * Math.cos(s)},${cy + r * Math.sin(s)} A${r},${r} 0 0,1 ${cx + r * Math.cos(e)},${cy + r * Math.sin(e)} Z`;
}

const C = {
  bg: "#0d1117", card: "#161b22", cell: "#21262d", cellHover: "#30363d",
  answered: "#0d1117", header: "#1f2937", accent: "#4a8cdb", border: "#30363d",
  text: "#e6edf3", muted: "#8b949e", green: "#3fb950", red: "#f85149",
};

export default function WheelOfJeopardy() {
  const [phase, setPhase] = useState("SETUP");
  const [players, setPlayers] = useState([
    { name: "Player 1", scores: [0, 0], tokens: 0 },
    { name: "Player 2", scores: [0, 0], tokens: 0 },
    { name: "Player 3", scores: [0, 0], tokens: 0 },
  ]);
  const [round, setRound] = useState(1);
  const [spinsLeft, setSpinsLeft] = useState(30);
  const [pidx, setPidx] = useState(0);
  const [cats, setCats] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [answered, setAnswered] = useState(new Set());
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [curSector, setCurSector] = useState(null);
  const [selCatIdx, setSelCatIdx] = useState(null);
  const [curQ, setCurQ] = useState(null);
  const [curQPoints, setCurQPoints] = useState(0);
  const [selAnswer, setSelAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [msg, setMsg] = useState("");
  const [tokenPrompt, setTokenPrompt] = useState(false);
  const [lostReason, setLostReason] = useState(null);
  const [setupNames, setSetupNames] = useState(["Player 1", "Player 2", "Player 3"]);
  const [numPlayers, setNumPlayers] = useState(3);
  const spinTimer = useRef(null);
  const resultTimer = useRef(null);

  const cp = players[pidx];
  const points = round === 1 ? POINTS_R1 : POINTS_R2;
  const totalAnswered = answered.size;
  const totalQuestions = cats.length * 5;
  const roundOver = spinsLeft <= 0 || totalAnswered >= totalQuestions;

  useEffect(() => { return () => { clearTimeout(spinTimer.current); clearTimeout(resultTimer.current); }; }, []);

  useEffect(() => {
    if (roundOver && phase === "READY" && cats.length > 0) {
      if (round === 1) {
        setPhase("ROUND_OVER");
        setMsg("Round 1 complete! Get ready for Round 2 with doubled point values.");
      } else {
        setPhase("GAME_OVER");
        const totals = players.map(p => p.scores[0] + p.scores[1]);
        const maxScore = Math.max(...totals);
        const winner = players[totals.indexOf(maxScore)];
        setMsg(`Game over! ${winner.name} wins with $${maxScore.toLocaleString()}!`);
      }
    }
  }, [roundOver, phase, round, cats.length]);

  const startGame = useCallback(() => {
    const plist = setupNames.slice(0, numPlayers).map((n, i) => ({
      name: n.trim() || `Player ${i + 1}`, scores: [0, 0], tokens: 0,
    }));
    const selected = shuffle(ALL_CATEGORIES).slice(0, 6);
    const sects = buildSectors(selected);
    setPlayers(plist);
    setCats(selected);
    setSectors(sects);
    setAnswered(new Set());
    setRound(1);
    setSpinsLeft(30);
    setPidx(0);
    setRotation(0);
    setMsg(`${plist[0].name}, spin the wheel!`);
    setPhase("READY");
  }, [setupNames, numPlayers]);

  const startRound2 = useCallback(() => {
    setAnswered(new Set());
    setRound(2);
    setSpinsLeft(30);
    setMsg(`Round 2! Point values are doubled. ${players[pidx].name}, spin the wheel!`);
    setPhase("READY");
  }, [players, pidx]);

  const nextTurn = useCallback(() => {
    const next = (pidx + 1) % players.length;
    setPidx(next);
    setMsg(`${players[next].name}, spin the wheel!`);
    setPhase("READY");
  }, [pidx, players]);

  const catFullyAnswered = useCallback((ci) => {
    return [0,1,2,3,4].every(qi => answered.has(`${ci}-${qi}`));
  }, [answered]);

  const doSpin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setSpinsLeft(s => s - 1);
    const target = Math.floor(Math.random() * SECTOR_COUNT);
    const extra = (4 + Math.floor(Math.random() * 4)) * 360;
    const targetAngle = target * SECTOR_DEG + SECTOR_DEG / 2;
    const base = Math.ceil(rotation / 360) * 360;
    const newRot = base + extra + targetAngle;
    setRotation(newRot);
    spinTimer.current = setTimeout(() => {
      setSpinning(false);
      const sector = sectors[target];
      setCurSector(sector);
      resolveSpin(sector);
    }, 3500);
  }, [spinning, rotation, sectors]);

  const resolveSpin = useCallback((sector) => {
    const name = players[pidx].name;
    if (sector.type === "CAT") {
      if (catFullyAnswered(sector.catIdx)) {
        setMsg(`${name} spun ${cats[sector.catIdx].name}, but all questions are answered. Spin again!`);
        setSpinsLeft(s => s + 1);
        setPhase("READY");
        return;
      }
      setSelCatIdx(sector.catIdx);
      setMsg(`${name}, you spun ${cats[sector.catIdx].name} — choose a point value from the board.`);
      setPhase("CHOOSE_Q");
    } else if (sector.type === "PLAYER_CH") {
      setMsg(`Player's choice! ${name}, choose any category and point value.`);
      setSelCatIdx(-1);
      setPhase("CHOOSE_Q");
    } else if (sector.type === "OPPONENT_CH") {
      setMsg(`Opponents' choice! Choose a category for ${name}.`);
      setPhase("OPP_CHOOSE");
    } else if (sector.type === "FREE_SPIN") {
      setPlayers(ps => ps.map((p, i) => i === pidx ? { ...p, tokens: p.tokens + 1 } : p));
      setMsg(`Free spin! ${name} earns a free-turn token. Spin again!`);
      setPhase("READY");
    } else if (sector.type === "LOSE_TURN") {
      if (players[pidx].tokens > 0) {
        setLostReason("lose_turn");
        setMsg(`Lose a turn! ${name}, use a free-turn token to spin again?`);
        setTokenPrompt(true);
        setPhase("TOKEN_PROMPT");
      } else {
        setMsg(`Lose a turn! ${name} has no tokens. Next player's turn.`);
        resultTimer.current = setTimeout(nextTurn, 2000);
      }
    } else if (sector.type === "BANKRUPT") {
      const ri = round - 1;
      setPlayers(ps => ps.map((p, i) => i === pidx ? { ...p, scores: p.scores.map((s, si) => si === ri ? 0 : s) } : p));
      setMsg(`Bankrupt! ${name} loses all points for this round!`);
      resultTimer.current = setTimeout(nextTurn, 2500);
    }
  }, [pidx, players, cats, round, catFullyAnswered, nextTurn]);

  const selectQuestion = useCallback((ci, qi) => {
    const key = `${ci}-${qi}`;
    if (answered.has(key)) return;
    if (phase === "CHOOSE_Q" && selCatIdx !== -1 && ci !== selCatIdx) return;
    const q = cats[ci].questions[qi];
    const pts = points[qi];
    setCurQ({ ...q, ci, qi });
    setCurQPoints(pts);
    setSelAnswer(null);
    setIsCorrect(null);
    setMsg(`${cp.name} — $${pts} question in ${cats[ci].name}`);
    setPhase("QUESTION");
  }, [answered, phase, selCatIdx, cats, points, cp]);

  const submitAnswer = useCallback((ansIdx) => {
    if (selAnswer !== null) return;
    setSelAnswer(ansIdx);
    const correct = ansIdx === curQ.a;
    setIsCorrect(correct);
    const key = `${curQ.ci}-${curQ.qi}`;
    setAnswered(prev => new Set([...prev, key]));
    const ri = round - 1;
    if (correct) {
      setPlayers(ps => ps.map((p, i) => i === pidx ? { ...p, scores: p.scores.map((s, si) => si === ri ? s + curQPoints : s) } : p));
      setMsg(`Correct! +$${curQPoints}. ${cp.name} spins again!`);
      resultTimer.current = setTimeout(() => {
        setCurQ(null);
        setPhase("READY");
      }, 2000);
    } else {
      setPlayers(ps => ps.map((p, i) => i === pidx ? { ...p, scores: p.scores.map((s, si) => si === ri ? s - curQPoints : s) } : p));
      setMsg(`Incorrect! The answer was "${curQ.o[curQ.a]}". -$${curQPoints}.`);
      resultTimer.current = setTimeout(() => {
        setCurQ(null);
        if (players[pidx].tokens > 0) {
          setLostReason("wrong");
          setMsg(`${cp.name}, use a free-turn token to spin again?`);
          setTokenPrompt(true);
          setPhase("TOKEN_PROMPT");
        } else {
          nextTurn();
        }
      }, 2500);
    }
  }, [selAnswer, curQ, round, pidx, curQPoints, cp, players, nextTurn]);

  const useToken = useCallback(() => {
    setPlayers(ps => ps.map((p, i) => i === pidx ? { ...p, tokens: p.tokens - 1 } : p));
    setTokenPrompt(false);
    setMsg(`${cp.name} uses a token! Spin again.`);
    setPhase("READY");
  }, [pidx, cp]);

  const declineToken = useCallback(() => {
    setTokenPrompt(false);
    nextTurn();
  }, [nextTurn]);

  const oppChoose = useCallback((ci) => {
    setSelCatIdx(ci);
    setMsg(`${cp.name}, choose a point value in ${cats[ci].name}.`);
    setPhase("CHOOSE_Q");
  }, [cp, cats]);

  // Wheel SVG
  const wheelSize = 260;
  const cx = wheelSize / 2, cy = wheelSize / 2, r = wheelSize / 2 - 12;

  const WheelSVG = useMemo(() => {
    if (!sectors.length) return null;
    return (
      <svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#374151" strokeWidth="3" />
        {sectors.map((sec, i) => {
          const mid = ((-90 + (i + 0.5) * SECTOR_DEG) * Math.PI) / 180;
          const lx = cx + r * 0.62 * Math.cos(mid);
          const ly = cy + r * 0.62 * Math.sin(mid);
          const rot = -90 + (i + 0.5) * SECTOR_DEG;
          return (
            <g key={i}>
              <path d={sectorPath(cx, cy, r, i)} fill={sec.color} stroke="#1a1f2e" strokeWidth="1.5" opacity={0.85} />
              <text x={lx} y={ly} fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle" dominantBaseline="central"
                transform={`rotate(${rot > 90 && rot < 270 ? rot + 180 : rot}, ${lx}, ${ly})`}
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                {sec.label}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="14" fill={C.accent} stroke="#1a1f2e" strokeWidth="2" />
      </svg>
    );
  }, [sectors]);

  // Setup screen
  if (phase === "SETUP") {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ background: C.card, borderRadius: 16, padding: "40px 48px", maxWidth: 440, width: "100%" }}>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>Wheel of Jeopardy</h1>
          <p style={{ color: C.muted, fontSize: 14, textAlign: "center", marginBottom: 32 }}>Enter player names to begin</p>
          {Array.from({ length: numPlayers }).map((_, i) => (
            <input key={i} value={setupNames[i] || ""} placeholder={`Player ${i + 1}`}
              onChange={e => { const n = [...setupNames]; n[i] = e.target.value; setSetupNames(n); }}
              style={{ width: "100%", padding: "10px 14px", marginBottom: 10, borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.cell, color: C.text, fontSize: 15, outline: "none", boxSizing: "border-box" }}
            />
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 20 }}>
            <button onClick={() => { if (numPlayers < 4) { setNumPlayers(numPlayers + 1); setSetupNames(n => [...n, `Player ${numPlayers + 1}`]); }}}
              disabled={numPlayers >= 4}
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.cell, color: numPlayers >= 4 ? C.muted : C.text, cursor: numPlayers >= 4 ? "default" : "pointer", fontSize: 13 }}>
              + Add player
            </button>
            <button onClick={() => { if (numPlayers > 2) setNumPlayers(numPlayers - 1); }}
              disabled={numPlayers <= 2}
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.cell, color: numPlayers <= 2 ? C.muted : C.text, cursor: numPlayers <= 2 ? "default" : "pointer", fontSize: 13 }}>
              − Remove player
            </button>
          </div>
          <button onClick={startGame}
            style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Start game
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (phase === "GAME_OVER") {
    const totals = players.map(p => p.scores[0] + p.scores[1]);
    const maxScore = Math.max(...totals);
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ background: C.card, borderRadius: 16, padding: "40px 48px", maxWidth: 500, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Game over!</h1>
          {players.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", marginBottom: 8,
              borderRadius: 10, background: totals[i] === maxScore ? "rgba(74,140,219,0.15)" : C.cell,
              border: totals[i] === maxScore ? `2px solid ${C.accent}` : `1px solid ${C.border}` }}>
              <span style={{ color: C.text, fontWeight: 600, fontSize: 16 }}>{p.name} {totals[i] === maxScore && "👑"}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: totals[i] >= 0 ? C.text : C.red, fontWeight: 700, fontSize: 20 }}>${totals[i].toLocaleString()}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>R1: ${p.scores[0].toLocaleString()} + R2: ${p.scores[1].toLocaleString()}</div>
              </div>
            </div>
          ))}
          <button onClick={() => { setPhase("SETUP"); setRound(1); setSpinsLeft(30); }}
            style={{ marginTop: 24, padding: "12px 32px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            New game
          </button>
        </div>
      </div>
    );
  }

  // Main game screen
  const boardClickable = phase === "CHOOSE_Q" || phase === "OPP_CHOOSE";
  const canSpin = phase === "READY" && !spinning && !roundOver;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: C.text, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.card, borderRadius: 12, padding: "12px 20px", marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Wheel of Jeopardy</h1>
        <span style={{ color: C.muted, fontSize: 14, fontWeight: 500 }}>Round {round} of 2</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>⟳ Spins left: {spinsLeft}</span>
      </div>

      {/* Main: Wheel + Board */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {/* Wheel panel */}
        <div style={{ background: C.card, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 300, flexShrink: 0 }}>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 2 }}>Current turn</div>
          <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{cp?.name}</div>
          {/* Wheel with pointer */}
          <div style={{ position: "relative", width: wheelSize, height: wheelSize, marginBottom: 16 }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 2, width: 0, height: 0,
              borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `18px solid ${C.accent}` }} />
            <div style={{ transition: spinning ? "transform 3.5s cubic-bezier(0.15, 0.7, 0.3, 1)" : "none", transform: `rotate(${rotation}deg)` }}>
              {WheelSVG}
            </div>
          </div>
          <button onClick={doSpin} disabled={!canSpin}
            style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: canSpin ? C.cell : C.answered,
              color: canSpin ? C.text : C.muted, fontSize: 15, fontWeight: 600, cursor: canSpin ? "pointer" : "default", marginBottom: 14 }}>
            ⟳ Spin the wheel
          </button>
          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center" }}>
            {Object.values(SPECIAL).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Board panel */}
        <div style={{ flex: 1, background: C.card, borderRadius: 12, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cats.length}, 1fr)`, gap: 6 }}>
            {/* Category headers */}
            {cats.map((cat, ci) => (
              <div key={ci} style={{ padding: "8px 4px", borderRadius: 8, background: CAT_COLORS[ci], textAlign: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", opacity: phase === "OPP_CHOOSE" ? 1 : 1,
                cursor: phase === "OPP_CHOOSE" && !catFullyAnswered(ci) ? "pointer" : "default",
                border: phase === "OPP_CHOOSE" && !catFullyAnswered(ci) ? "2px solid #fff" : "2px solid transparent",
                transition: "border-color 0.2s" }}
                onClick={() => { if (phase === "OPP_CHOOSE" && !catFullyAnswered(ci)) oppChoose(ci); }}>
                {cat.name}
              </div>
            ))}
            {/* Question cells */}
            {[0,1,2,3,4].map(qi => cats.map((cat, ci) => {
              const key = `${ci}-${qi}`;
              const done = answered.has(key);
              const clickable = boardClickable && !done && (selCatIdx === -1 || selCatIdx === ci) && phase === "CHOOSE_Q";
              const pts = points[qi];
              return (
                <div key={key} onClick={() => clickable && selectQuestion(ci, qi)}
                  style={{ padding: "12px 4px", borderRadius: 8, textAlign: "center", fontSize: 16, fontWeight: 700,
                    background: done ? C.answered : C.cell, color: done ? C.muted : "#d4a843",
                    border: done ? `1px solid ${C.border}` : clickable ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                    cursor: clickable ? "pointer" : "default", transition: "all 0.15s",
                    opacity: done ? 0.4 : (boardClickable && !clickable && !done) ? 0.35 : 1 }}>
                  {done ? "—" : `$${pts}`}
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Announcer */}
      <div style={{ background: C.card, borderRadius: 12, padding: "12px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>🔊</span>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{msg}</span>
      </div>

      {/* Player cards */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${players.length}, 1fr)`, gap: 12 }}>
        {players.map((p, i) => {
          const total = p.scores[0] + p.scores[1];
          const roundScore = p.scores[round - 1];
          const isActive = i === pidx;
          return (
            <div key={i} style={{ background: C.card, borderRadius: 12, padding: "16px 20px",
              border: isActive ? `2px solid ${C.accent}` : `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</span>
                {isActive && <span style={{ background: C.accent, color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>Active</span>}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: total < 0 ? C.red : C.text, marginBottom: 4 }}>
                {total < 0 ? "−" : ""}${Math.abs(total).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                🎟 {p.tokens} free-turn token{p.tokens !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Question modal */}
      {phase === "QUESTION" && curQ && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: "32px 36px", maxWidth: 520, width: "90%", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>{cats[curQ.ci].name}</span>
              <span style={{ color: "#d4a843", fontWeight: 700, fontSize: 14 }}>${curQPoints}</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5, marginBottom: 24 }}>{curQ.q}</p>
            {curQ.o.map((opt, oi) => {
              let bg = C.cell, bdr = C.border, clr = C.text;
              if (selAnswer !== null) {
                if (oi === curQ.a) { bg = "rgba(63,185,80,0.15)"; bdr = C.green; clr = C.green; }
                else if (oi === selAnswer && !isCorrect) { bg = "rgba(248,81,73,0.15)"; bdr = C.red; clr = C.red; }
              }
              return (
                <button key={oi} onClick={() => submitAnswer(oi)} disabled={selAnswer !== null}
                  style={{ display: "block", width: "100%", padding: "12px 16px", marginBottom: 8, borderRadius: 10,
                    border: `1.5px solid ${bdr}`, background: bg, color: clr, fontSize: 15, fontWeight: 500,
                    textAlign: "left", cursor: selAnswer !== null ? "default" : "pointer", transition: "all 0.15s" }}>
                  <span style={{ fontWeight: 700, marginRight: 10, opacity: 0.5 }}>{String.fromCharCode(65 + oi)}</span>{opt}
                </button>
              );
            })}
            {selAnswer !== null && (
              <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, textAlign: "center",
                background: isCorrect ? "rgba(63,185,80,0.12)" : "rgba(248,81,73,0.12)", color: isCorrect ? C.green : C.red }}>
                {isCorrect ? `✓ Correct! +$${curQPoints}` : `✗ Incorrect. The answer was "${curQ.o[curQ.a]}". −$${curQPoints}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Token prompt modal */}
      {phase === "TOKEN_PROMPT" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: "32px 36px", maxWidth: 420, width: "90%", textAlign: "center", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎟</div>
            <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{cp.name}, use a free-turn token?</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>You have {players[pidx].tokens} token{players[pidx].tokens !== 1 ? "s" : ""} remaining.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={useToken}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Use token
              </button>
              <button onClick={declineToken}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.cell, color: C.text, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Pass turn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round over modal */}
      {phase === "ROUND_OVER" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: "32px 36px", maxWidth: 440, width: "90%", textAlign: "center", border: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Round 1 complete!</h2>
            {players.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", marginBottom: 6, borderRadius: 8, background: C.cell }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontWeight: 700, color: p.scores[0] < 0 ? C.red : C.text }}>${p.scores[0].toLocaleString()}</span>
              </div>
            ))}
            <p style={{ color: C.muted, fontSize: 13, margin: "16px 0" }}>Round 2 point values will be doubled!</p>
            <button onClick={startRound2}
              style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Start Round 2
            </button>
          </div>
        </div>
      )}

      {/* Opponents choice overlay */}
      {phase === "OPP_CHOOSE" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: "32px 36px", maxWidth: 440, width: "90%", textAlign: "center", border: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Opponents' choice</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Choose a category for {cp.name}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {cats.map((cat, ci) => {
                const full = catFullyAnswered(ci);
                return (
                  <button key={ci} onClick={() => !full && oppChoose(ci)} disabled={full}
                    style={{ padding: "12px", borderRadius: 10, border: `1.5px solid ${full ? C.border : CAT_COLORS[ci]}`,
                      background: full ? C.answered : C.cell, color: full ? C.muted : CAT_COLORS[ci],
                      fontSize: 14, fontWeight: 600, cursor: full ? "default" : "pointer" }}>
                    {cat.name}{full ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
