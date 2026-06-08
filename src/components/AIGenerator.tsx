import React, { useState } from "react";
import { Sparkles, Image as ImageIcon, Send, AlertCircle, Copy, Check, Grid, Wand2 } from "lucide-react";
import { Slide } from "../types";

interface AIGeneratorProps {
  activeSlide: Slide | null | undefined;
  onUpdateSlide: (updated: Slide) => void;
  carouselTheme?: string;
  aspectRatio?: string;
}

interface ImageResult {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export default function AIGenerator({
  activeSlide,
  onUpdateSlide,
  carouselTheme,
  aspectRatio = "1:1"
}: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gallery history of generated images
  const [gallery, setGallery] = useState<ImageResult[]>([
    {
      id: "preset-1",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
      prompt: "Inspiração Abstrata 3D fluida",
      timestamp: new Date()
    },
    {
      id: "preset-2",
      url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80",
      prompt: "Gradiente Holográfico Moderno",
      timestamp: new Date()
    }
  ]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorStatus("");

    try {
      // 1. Optimize prompt with IA first for even better results
      let optimizedText = prompt;
      try {
        const optimizeRes = await fetch("/api/optimize-image-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userDescription: prompt,
            carouselTheme: carouselTheme || ""
          })
        });
        if (optimizeRes.ok) {
          const optimizeData = await optimizeRes.json();
          if (optimizeData.optimizedPrompt) {
            optimizedText = optimizeData.optimizedPrompt;
          }
        }
      } catch (optErr) {
        console.warn("Falha silenciosa ao otimizar o prompt, usando original.", optErr);
      }

      // 2. Generate actual image
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: optimizedText,
          aspectRatio: aspectRatio
        })
      });

      if (!response.ok) {
        throw new Error("Erro de infraporte ou pico de tráfego.");
      }

      const data = await response.json();
      if (data.imageUrl) {
        const newResult: ImageResult = {
          id: `gen-${Date.now()}`,
          url: data.imageUrl,
          prompt: prompt,
          timestamp: new Date()
        };

        // Add to gallery
        setGallery(prev => [newResult, ...prev]);

        // Auto apply to active slide if exists
        if (activeSlide) {
          onUpdateSlide({
            ...activeSlide,
            imagePrompt: prompt,
            imageUrl: data.imageUrl,
            imageLayout: activeSlide.imageLayout && activeSlide.imageLayout !== "none" ? activeSlide.imageLayout : "card"
          });
        }
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (err) {
      console.error(err);
      setErrorStatus("Sem conexão direta com a GPU da IA. Aplicando banco premium elegante como alternativa.");

      // Generates beautiful Picsum topic image as fallback
      const cleanKeywords = prompt
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 3)
        .join("-");
      
      const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(cleanKeywords || "abstract-design")}/800/800`;
      
      const newFallbackResult: ImageResult = {
        id: `fb-${Date.now()}`,
        url: fallbackUrl,
        prompt: prompt,
        timestamp: new Date()
      };

      setGallery(prev => [newFallbackResult, ...prev]);

      if (activeSlide) {
        onUpdateSlide({
          ...activeSlide,
          imagePrompt: prompt,
          imageUrl: fallbackUrl,
          imageLayout: activeSlide.imageLayout && activeSlide.imageLayout !== "none" ? activeSlide.imageLayout : "card"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = (imgUrl: string, origPrompt: string) => {
    if (!activeSlide) return;
    onUpdateSlide({
      ...activeSlide,
      imagePrompt: origPrompt,
      imageUrl: imgUrl,
      imageLayout: activeSlide.imageLayout && activeSlide.imageLayout !== "none" ? activeSlide.imageLayout : "card"
    });
  };

  const handleCopyPrompt = (p: string, id: string) => {
    navigator.clipboard.writeText(p);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4" id="ai-generator-widget">
      {/* Search Input Container */}
      <form onSubmit={handleGenerate} className="space-y-2.5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span>Descreva o que deseja ver</span>
            <span className="text-emerald-400 font-mono text-[8.5px] lowercase">Criador Estético</span>
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Uma estátua clássica neon azul 3D estética moderna de negócios"
              rows={2}
              className="w-full text-xs bg-slate-950 text-slate-150 placeholder:text-slate-700 rounded-xl p-3 pr-10 border border-slate-850 focus:outline-none focus:border-emerald-500 transition duration-300 resize-none font-sans"
              id="ai-prompt-input"
            />
            <div className="absolute right-3.5 bottom-3.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-[11px] font-black tracking-widest uppercase transition duration-350 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          id="btn-ai-generate-submit"
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
              <span>Gerando com Supercomputador...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>Gerar Imagem Estética</span>
            </>
          )}
        </button>
      </form>

      {/* Warning/Fallback banner */}
      {errorStatus && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-[9.5px] text-amber-400 leading-tight">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* Grid of Results / Clickable Gallery history */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Grid className="w-3.5 h-3.5 text-slate-500" />
            Galeria da Sessão ({gallery.length})
          </span>
          <span className="text-[8.5px] text-slate-500">Clique para aplicar</span>
        </div>

        {/* Selected slide state warning */}
        {!activeSlide && (
          <p className="text-[9px] text-amber-500/80 bg-amber-500/5 p-1.5 rounded-lg text-center">
            ⚠️ Selecione um slide abaixo para aplicar imagens diretamente com 1 clique!
          </p>
        )}

        <div className="grid grid-cols-2 gap-2" id="gallery-results-grid">
          {gallery.map((img) => {
            const isActiveOnSlide = activeSlide?.imageUrl === img.url;
            return (
              <div
                key={img.id}
                className={`relative group overflow-hidden rounded-xl border bg-slate-950 aspect-video flex flex-col justify-between transition-all duration-300 ${
                  isActiveOnSlide
                    ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500"
                    : "border-slate-850 hover:border-slate-700 hover:shadow-lg"
                }`}
              >
                {/* Visual Thumbnail */}
                <img
                  src={img.url}
                  alt={img.prompt}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500 cursor-pointer"
                  onClick={() => handleSelectImage(img.url, img.prompt)}
                />
                
                {/* Overlay details when hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-1.5 pt-4 transition duration-300 pointer-events-none">
                  <p className="text-[8px] text-slate-300 truncate font-semibold" title={img.prompt}>
                    {img.prompt}
                  </p>
                </div>

                {/* Quick Interactive buttons */}
                <div className="absolute top-1 right-1 flex gap-1 z-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPrompt(img.prompt, img.id);
                    }}
                    className="p-1 rounded bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition cursor-pointer"
                    title="Copiar Prompt original"
                  >
                    {copiedId === img.id ? (
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectImage(img.url, img.prompt);
                    }}
                    className={`p-1 rounded cursor-pointer transition ${
                      isActiveOnSlide
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-900/90 text-slate-400 hover:text-slate-100"
                    }`}
                    title={isActiveOnSlide ? "Aplicada" : "Aplicar no slide"}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3px]" />
                  </button>
                </div>

                {/* Left Active indicator tag */}
                {isActiveOnSlide && (
                  <div className="absolute top-1 left-1 bg-emerald-500 text-slate-950 text-[7px] font-black uppercase px-1 rounded shadow-md pointer-events-none">
                    ATIVO
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
