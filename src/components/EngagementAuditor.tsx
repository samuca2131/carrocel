import React, { useState } from "react";
import { Gauge, Sparkles, TrendingUp, Check, AlertTriangle, Clock } from "lucide-react";
import { Slide, EngagementAudit } from "../types";

interface EngagementAuditorProps {
  theme: string;
  niche: string;
  slides: Slide[];
}

export default function EngagementAuditor({ theme, niche, slides }: EngagementAuditorProps) {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<EngagementAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async () => {
    if (!slides || slides.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze-engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: theme, niche, slides })
      });
      if (!response.ok) {
        throw new Error("Erro na rede ao extrair análise do post");
      }
      const data = await response.json();
      setAudit(data);
    } catch (err) {
      console.error(err);
      setError("Falha ao auditar post. Verifique as credenciais da API ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Visual SVG dial progress renderer helper
  const renderCircleScore = (score: number, label: string, colorClass: string) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-2">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Background circle */}
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-slate-800 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`fill-none transition-all duration-1000 ${colorClass}`}
              strokeWidth="6"
            />
          </svg>
          <span className="absolute text-sm font-black text-slate-100">{score}%</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-5" id="engagement-auditor-root">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Análise de Performance IA
          </h3>
          <p className="text-[10px] text-slate-500 leading-tight">
            Validação instantânea de engajamento, legibilidade e ganchos de conversão.
          </p>
        </div>

        {!audit && (
          <button
            onClick={startAnalysis}
            disabled={loading}
            className={`py-2 px-3 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all duration-300 ${
              loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
            }`}
            id="btn-trigger-audit"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Calculando..." : "Analisar Post"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && !audit && (
        <div className="flex flex-col items-center justify-center py-10 space-y-3" id="loading-audit-visual">
          <div className="w-10 h-10 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[11px] text-slate-400 font-medium">
            O robô de audição está lendo seus slides e calculando as médias...
          </p>
        </div>
      )}

      {audit && (
        <div className="space-y-4 animate-fade-in" id="analysis-report-container">
          {/* Speedometer gauge grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {renderCircleScore(audit.hookScore, "Scroll Stopper", "stroke-rose-500")}
            {renderCircleScore(audit.readabilityScore, "Legibilidade", "stroke-cyan-500")}
            {renderCircleScore(audit.ctaScore, "Chamada CTA", "stroke-amber-500")}
            {renderCircleScore(audit.retentionScore, "Retenção", "stroke-indigo-500")}
          </div>

          {/* Combined general rating info banner */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Média de Performance Geral</p>
                <p className="text-xl font-black text-slate-100 mt-0.5">
                  Análise: <span className="text-emerald-400">{audit.overallScore}/100</span>
                </p>
              </div>
            </div>

            <div className="text-right flex items-center gap-1.5 text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left font-mono">
                <span className="block text-[8px] uppercase font-bold text-slate-600 leading-none">Tempo Leitura</span>
                <span className="text-[11px] font-bold text-slate-200">{audit.auditDetails.estimatedReadingTime}</span>
              </div>
            </div>
          </div>

          {/* Pros and cons list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1" id="audit-pros-cons">
            <div className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-emerald-500/5">
              <h4 className="text-[11px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <Check className="w-4 h-4 bg-emerald-500/10 p-0.5 rounded-full" />
                Pontos Fortes
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                {audit.auditDetails.strongPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-rose-500/5">
              <h4 className="text-[11px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Oportunidades de Ajuste
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                {audit.auditDetails.weakPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Design recommendation label block */}
          <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-400">
            <strong className="text-emerald-400">💡 Sugestão Relatório: </strong>
            {audit.auditDetails.designRecommendation}
          </div>

          <div className="flex justify-center">
            <button
              onClick={startAnalysis}
              className="text-[10px] text-slate-500 hover:text-emerald-400 underline font-semibold cursor-pointer"
            >
              Excluir relatório e reavaliar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
