import { useState } from "react";
import { Sparkles, FileText, Copy, Check, Hash } from "lucide-react";
import { Slide, AICaption } from "../types";

interface LegendaGeneratorProps {
  theme: string;
  niche: string;
  slides: Slide[];
}

export default function LegendaGenerator({ theme, niche, slides }: LegendaGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState<AICaption | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!slides || slides.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, niche, slides })
      });
      if (!response.ok) {
        throw new Error("Falha ao gerar legenda na rede");
      }
      const data = await response.json();
      setCaption(data);
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar legenda. Verifique se o servidor está ativo.");
    } finally {
      setLoading(false);
    }
  };

  const getFullText = () => {
    if (!caption) return "";
    return `${caption.hookLine}

${caption.captionIntro}

${caption.bodyBullets.map(b => `• ${b}`).join("\n")}

${caption.ctaSentence}

${caption.bonusAction ? `${caption.bonusAction}\n` : ""}
${caption.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(" ")}`;
  };

  const handleCopy = () => {
    const txt = getFullText();
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4" id="legenda-generator-container">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            Legenda & Hashtags IA
          </h3>
          <p className="text-[10px] text-slate-500 leading-tight">
            Escreva o post complementar do feed focado em algoritmos, SEO e alcance orgânico.
          </p>
        </div>

        {!caption && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all duration-300 ${
              loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
            }`}
            id="btn-create-legenda"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Rascunhando..." : "Criar Legenda"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && !caption && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3" id="loading-legends-visual">
          <div className="w-8 h-8 border-3 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[10px] text-slate-400 font-medium">
            IA redigindo storytelling complementar de vendas...
          </p>
        </div>
      )}

      {caption && (
        <div className="space-y-4 animate-fade-in" id="legends-results-sheet">
          {/* Main scrollable text block container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative text-sm text-slate-300 font-sans leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-text scrollbar-thin">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-100 rounded-lg transition border border-slate-800 flex items-center gap-1 cursor-pointer"
              title="Copiar Legenda Inteira"
              id="copy-legend-button"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400">Copiada</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold">Copiar</span>
                </>
              )}
            </button>

            {/* Structured view elements for absolute formatting validation */}
            <p className="font-extrabold text-slate-100 italic border-l-2 border-emerald-500 pl-2 text-sm">{caption.hookLine}</p>
            <p className="mt-3.5 text-xs text-slate-400">{caption.captionIntro}</p>
            
            <div className="my-3.5 space-y-1.5">
              {caption.bodyBullets.map((bull, bidx) => (
                <div key={bidx} className="flex gap-2 text-xs">
                  <span className="text-emerald-400">✔</span>
                  <span>{bull}</span>
                </div>
              ))}
            </div>

            <p className="font-bold text-emerald-400 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 text-xs">{caption.ctaSentence}</p>
            
            {caption.bonusAction && (
              <p className="mt-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{caption.bonusAction}</p>
            )}

            <div className="flex flex-wrap gap-1 mt-3.5 pt-3 border-t border-slate-800">
              {caption.hashtags.map((tag, tid) => (
                <span key={tid} className="text-[10px] bg-slate-950 text-slate-500 rounded px-2 py-0.5 border border-slate-850 hover:text-emerald-400 select-none">
                  #{tag.replace('#', '')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 bg-slate-900 border border-slate-800/60 p-2.5 rounded-xl">
            <span className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-600" />
              Pronto para colar no Instagram / LinkedIn.
            </span>
            <button
              onClick={handleGenerate}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Re-escrever legenda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
