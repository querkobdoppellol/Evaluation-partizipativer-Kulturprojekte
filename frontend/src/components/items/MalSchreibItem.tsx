import { useEffect, useRef, useState } from 'react';
import type { Item, MalSchreibAnswer } from '../../types/instrument';
import type { useTTS } from '../../hooks/useTTS';
import { ItemShell } from './ItemShell';

const FARBEN   = ['#1a1a1a', '#e53e3e', '#3182ce', '#38a169', '#d69e2e', '#805ad5', '#ffffff'];
const CANVAS_W = 800;
const CANVAS_H = 480;
const PAD      = 32;
const FONT_SZ  = 22;
const LINE_H   = 32;

interface Props {
  item: Item;
  nummer: number;
  gesamt: number;
  value: MalSchreibAnswer;
  onChange: (v: MalSchreibAnswer) => void;
  onDownload?: () => void;
  tts: ReturnType<typeof useTTS>;
}

function canvasPt(clientX: number, clientY: number, canvas: HTMLCanvasElement) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left) * (CANVAS_W / r.width),
    y: (clientY - r.top)  * (CANVAS_H / r.height),
  };
}

// Word-wrap helpers for the PNG export
function lineCount(ctx: CanvasRenderingContext2D, text: string, maxW: number): number {
  let n = 0;
  for (const para of text.split('\n')) {
    if (!para.trim()) { n++; continue; }
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) { n++; line = word; } else line = test;
    }
    if (line) n++;
  }
  return Math.max(n, 1);
}

function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y0: number, maxW: number) {
  let y = y0;
  for (const para of text.split('\n')) {
    if (!para.trim()) { y += LINE_H; continue; }
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y); y += LINE_H; line = word;
      } else line = test;
    }
    if (line) { ctx.fillText(line, x, y); y += LINE_H; }
  }
}

export function MalSchreibItem({ item, nummer, gesamt, value, onChange, onDownload, tts }: Props) {
  const [aktiveFarbe, setAktiveFarbe] = useState(FARBEN[0]);
  const [text, setText]               = useState(value.text ?? '');
  const usedColors = useRef<Set<string>>(new Set([FARBEN[0]]));
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const textRef    = useRef(value.text ?? ''); // stale-closure-safe for saveCanvas
  const drawingRef = useRef(false);
  const lastPt     = useRef<{ x: number; y: number } | null>(null);

  // Restore previous drawing on mount
  useEffect(() => {
    if (!value.drawing || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => canvasRef.current?.getContext('2d')?.drawImage(img, 0, 0);
    img.src = value.drawing;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas drawing ─────────────────────────────────────────────────────────

  function saveCanvas() {
    const dataUrl = canvasRef.current?.toDataURL();
    onChange({ text: textRef.current, drawing: dataUrl, farben_genutzt: usedColors.current.size });
  }

  function startDraw(x: number, y: number) {
    drawingRef.current = true;
    lastPt.current = { x, y };
  }

  function moveDraw(x: number, y: number) {
    if (!drawingRef.current || !lastPt.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.strokeStyle = aktiveFarbe;
    ctx.lineWidth   = aktiveFarbe === '#ffffff' ? 24 : 4;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPt.current = { x, y };
  }

  function endDraw() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPt.current = null;
    saveCanvas();
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  function handleFarbwahl(farbe: string) {
    setAktiveFarbe(farbe);
    usedColors.current.add(farbe);
  }

  function handleTextChange(t: string) {
    setText(t);
    textRef.current = t;
    onChange({ ...value, text: t, farben_genutzt: usedColors.current.size });
  }

  function handleClear() {
    if (!canvasRef.current) return;
    canvasRef.current.getContext('2d')!.clearRect(0, 0, CANVAS_W, CANVAS_H);
    onChange({ ...value, drawing: undefined, farben_genutzt: 0 });
  }

  // ── PNG Export ─────────────────────────────────────────────────────────────

  function downloadPNG() {
    const hasText = text.trim().length > 0;

    // Measure text height with a throwaway canvas (so we set final height only once)
    let textSectionH = 0;
    if (hasText) {
      const meas = document.createElement('canvas').getContext('2d')!;
      meas.font = `${FONT_SZ}px system-ui, sans-serif`;
      textSectionH = lineCount(meas, text, CANVAS_W - PAD * 2) * LINE_H + PAD * 2;
    }

    const off = document.createElement('canvas');
    off.width  = CANVAS_W;
    off.height = CANVAS_H + textSectionH;

    const ctx = off.getContext('2d')!;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, off.width, off.height);

    // Drawing content
    if (canvasRef.current) ctx.drawImage(canvasRef.current, 0, 0);

    // Text section
    if (hasText) {
      // Divider
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H);
      ctx.lineTo(CANVAS_W, CANVAS_H);
      ctx.stroke();

      ctx.fillStyle = '#1a1a1a';
      ctx.font      = `${FONT_SZ}px system-ui, sans-serif`;
      drawWrapped(ctx, text, PAD, CANVAS_H + PAD + FONT_SZ, CANVAS_W - PAD * 2);
    }

    const a = document.createElement('a');
    a.download = 'mein-bild.png';
    a.href     = off.toDataURL('image/png');
    a.click();

    onDownload?.();
  }

  const hasContent = !!value.drawing || text.trim().length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ItemShell item={item} nummer={nummer} gesamt={gesamt} tts={tts}>

      {/* Farbwahl */}
      <div className="flex items-center gap-3 flex-wrap">
        {FARBEN.map((f) => (
          <button
            key={f}
            onClick={() => handleFarbwahl(f)}
            aria-label={f === '#ffffff' ? 'Radierer' : `Farbe ${f}`}
            title={f === '#ffffff' ? 'Radierer' : undefined}
            style={{ backgroundColor: f }}
            className={`w-10 h-10 rounded-full border-4 transition-all
              ${f === '#ffffff' ? 'border-gray-300' : 'border-transparent'}
              ${aktiveFarbe === f ? '!border-gray-800 scale-110' : ''}`}
          >
            {f === '#ffffff' && <span className="text-gray-400 text-xs leading-none">✕</span>}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded"
        >
          Alles löschen
        </button>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 bg-white touch-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
          onMouseDown={(e) => {
            const { x, y } = canvasPt(e.clientX, e.clientY, canvasRef.current!);
            startDraw(x, y);
          }}
          onMouseMove={(e) => {
            const { x, y } = canvasPt(e.clientX, e.clientY, canvasRef.current!);
            moveDraw(x, y);
          }}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            const { x, y } = canvasPt(t.clientX, t.clientY, canvasRef.current!);
            startDraw(x, y);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            const { x, y } = canvasPt(t.clientX, t.clientY, canvasRef.current!);
            moveDraw(x, y);
          }}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Textfeld */}
      <textarea
        rows={4}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Hier kannst du etwas schreiben …"
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg resize-none
          focus:outline-none focus:border-blue-400 bg-gray-50"
      />

      {/* Download */}
      <button
        onClick={downloadPNG}
        disabled={!hasContent}
        className="w-full py-3 rounded-2xl border-2 border-blue-200 text-blue-600 font-semibold
          hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        📥 Als PNG speichern
      </button>

    </ItemShell>
  );
}
