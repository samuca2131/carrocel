import React, { useState } from "react";
import { Sparkles, Sliders, Layers, Target, HelpCircle, Eye, Image as ImageIcon, Wand2, Trash2 } from "lucide-react";
import { NICHE_OPTIONS, OBJECTIVE_OPTIONS, Slide } from "../types";
import AIGenerator from "./AIGenerator";

interface SidebarGeneratorProps {
  onGenerate: (generatorParams: {
    prompt: string;
    niche: string;
    objective: string;
    targetAudience: string;
    numberOfSlides: number;
  }) => void;
  isLoading: boolean;
  activeTab: 'generator' | 'brand' | 'elements';
  setActiveTab: (tab: 'generator' | 'brand' | 'elements') => void;
  brandSettings: any;
  setBrandSettings: (settings: any) => void;
  activeSlide?: Slide | null;
  onUpdateSlide?: (updated: Slide) => void;
  carouselTheme?: string;
  slidesCount?: number;
  activeSlideIndex?: number;
  renderAIGenerator?: React.ReactNode;
}

export default function SidebarGenerator({
  onGenerate,
  isLoading,
  activeTab,
  setActiveTab,
  brandSettings,
  setBrandSettings,
  activeSlide,
  onUpdateSlide,
  carouselTheme,
  slidesCount,
  activeSlideIndex = 0,
  renderAIGenerator
}: SidebarGeneratorProps) {
  // Input fields
  const [prompt, setPrompt] = useState("");
  const [niche, setNiche] = useState(NICHE_OPTIONS[0]);
  const [customNiche, setCustomNiche] = useState("");
  const [useCustomNiche, setUseCustomNiche] = useState(false);
  const [objective, setObjective] = useState(OBJECTIVE_OPTIONS[3].value); // Educativo as default
  const [targetAudience, setTargetAudience] = useState("");
  const [numberOfSlides, setNumberOfSlides] = useState(7);

  // IA Sidebar image states
  const [imgDescription, setImgDescription] = useState("");
  const [optimizedImgPrompt, setOptimizedImgPrompt] = useState("");
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [isGeneratingImgFromSidebar, setIsGeneratingImgFromSidebar] = useState(false);
  const [previewImgUrl, setPreviewImgUrl] = useState("");
  const [sidebarImgError, setSidebarImgError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      niche: useCustomNiche && customNiche ? customNiche : niche,
      objective,
      targetAudience: targetAudience.trim() || "Público geral nas redes sociais",
      numberOfSlides
    });
  };

  const handleNicheChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setUseCustomNiche(true);
    } else {
      setUseCustomNiche(false);
      setNiche(val);
    }
  };

  return (
    <div className="w-80 md:w-96 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col focus-element text-slate-100" id="sidebar-panel">
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-800 bg-slate-950 p-2" id="sidebar-tab-navigation">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex-1 py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'generator'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-100'
          }`}
          id="btn-tab-gen"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Gerador IA
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex-1 py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'brand'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-100'
          }`}
          id="btn-tab-brand"
        >
          <Sliders className="w-3.5 h-3.5" />
          Branding
        </button>
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'elements'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
              : 'text-slate-400 hover:text-slate-100'
          }`}
          id="btn-tab-elements"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Imagens IA
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin" id="sidebar-scroll-wrapper">
        {activeTab === 'generator' && (
          <form onSubmit={handleSubmit} className="space-y-5" id="carousel-creator-form">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <span>Tema ou Ideia Central</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={3}
                placeholder="Exemplo: 5 gatilhos psicológicos para dobrar as vendas em e-commerce utilizando escassez"
                className="w-full text-sm bg-slate-950 text-slate-100 placeholder:text-slate-600 rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-emerald-500 transition duration-300 resize-none"
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Nossa IA vai planejar a sequência lógica do seu carrossel, criar ganchos virais e propor o melhor layout.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Nicho de Mercado
              </label>
              <select
                onChange={handleNicheChange}
                className="w-full text-sm bg-slate-950 text-slate-100 rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-emerald-500 transition duration-300"
              >
                {NICHE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="custom">✍️ Inserir outro nicho personalizado...</option>
              </select>

              {useCustomNiche && (
                <input
                  type="text"
                  required
                  placeholder="Escreva seu nicho customizado"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  className="w-full text-sm mt-2 bg-slate-950 text-slate-100 placeholder:text-slate-600 rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-emerald-500 transition duration-300"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Objetivo do Conteúdo
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full text-sm bg-slate-950 text-slate-100 rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-emerald-500 transition duration-300"
              >
                {OBJECTIVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                Público-Alvo <span className="text-[10px] text-slate-600 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Jovens investidores de 20-30 anos"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full text-sm bg-slate-950 text-slate-100 placeholder:text-slate-600 rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-emerald-500 transition duration-300"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-400 tracking-wider">
                <span>Número de Slides</span>
                <span className="text-emerald-400 text-sm font-extrabold">{numberOfSlides}</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={numberOfSlides}
                onChange={(e) => setNumberOfSlides(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Min: 5 slides</span>
                <span>Foco em Entrega</span>
                <span>Max: 20 slides</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className={`w-full py-4 px-4 rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold tracking-wide shadow-lg cursor-pointer transition-all duration-300 ${
                isLoading || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/10 active:scale-[0.98]'
              }`}
              id="submit-generate-button"
            >
              <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Roteirizando Carrossel...' : 'Gerar Roteiro com IA'}
            </button>
          </form>
        )}

        {activeTab === 'brand' && (
          <div className="space-y-6" id="brand-settings-panel">
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2">Marca & Configuração Geral</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Assinatura do Rodapé (User Handle)
              </label>
              <input
                type="text"
                placeholder="Ex: @seu.perfil"
                value={brandSettings.handle}
                onChange={(e) => setBrandSettings({ ...brandSettings, handle: e.target.value })}
                className="w-full text-sm bg-slate-950 text-slate-100 placeholder:text-slate-600 rounded-xl p-3 border border-slate-800 focus:outline-none focus:border-emerald-500 transition duration-300"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Exibir rodapé de marca</span>
                <button
                  type="button"
                  onClick={() => setBrandSettings({ ...brandSettings, showWatermark: !brandSettings.showWatermark })}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                    brandSettings.showWatermark ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-slate-100 shadow transition-transform duration-300 transform ${
                    brandSettings.showWatermark ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Exibir número do slide</span>
                <button
                  type="button"
                  onClick={() => setBrandSettings({ ...brandSettings, showSlideNumber: !brandSettings.showSlideNumber })}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                    brandSettings.showSlideNumber ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-slate-100 shadow transition-transform duration-300 transform ${
                    brandSettings.showSlideNumber ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Formato de Proporção (Aspect Ratio)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBrandSettings({ ...brandSettings, aspectRatio: '1:1' })}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                    brandSettings.aspectRatio === '1:1'
                      ? 'border-emerald-500 bg-slate-950 font-bold text-emerald-400'
                      : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <div className="w-6 h-6 border-2 border-current rounded" />
                  <span className="text-[10px]">Feed (1:1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandSettings({ ...brandSettings, aspectRatio: '9:16' })}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                    brandSettings.aspectRatio === '9:16'
                      ? 'border-emerald-500 bg-slate-950 font-bold text-emerald-400'
                      : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <div className="w-5 h-7 border-2 border-current rounded" />
                  <span className="text-[10px]">Stories (9:16)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandSettings({ ...brandSettings, aspectRatio: '16:9' })}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                    brandSettings.aspectRatio === '16:9'
                      ? 'border-emerald-500 bg-slate-950 font-bold text-emerald-400'
                      : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <div className="w-8 h-4 border-2 border-current rounded" />
                  <span className="text-[10px]">Landscape (16:9)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Elements / AI Images */}
        {activeTab === 'elements' && (
          <div className="space-y-4" id="ai-sidebar-image-generator">
            <div className="border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Biblioteca Visual IA</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Escreva conceitos visuais para criar imagens sob demanda com IA. Clique em qualquer imagem da galeria abaixo para aplicá-la ou substituí-la no slide ativo!
              </p>
            </div>

            {/* Selected Slide Segment header */}
            {activeSlide ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs transition duration-300">
                <div className="min-w-0 pr-2">
                  <span className="text-slate-500 block text-[9.5px] font-bold uppercase tracking-wider">Slide Ativo</span>
                  <span className="text-slate-250 font-black truncate block">
                    #{activeSlideIndex + 1}: {activeSlide.title || "Sem título"}
                  </span>
                </div>
                <span className="text-[9px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                  Vinculado
                </span>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/5 border border-amber-500/15 text-amber-400 text-xs rounded-xl text-center">
                Observe: Nenhum slide ativo selecionado no painel central.
              </div>
            )}

            {/* AIGenerator Component integration */}
            {renderAIGenerator ? (
              renderAIGenerator
            ) : (
              <AIGenerator
                activeSlide={activeSlide}
                onUpdateSlide={(updated) => onUpdateSlide && onUpdateSlide(updated)}
                carouselTheme={carouselTheme}
                aspectRatio={brandSettings?.aspectRatio || "1:1"}
              />
            )}

            {/* Layout Positioning Settings for applied image */}
            {activeSlide && activeSlide.imageUrl && (
              <div className="pt-3.5 border-t border-slate-850 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alinhamento Tridimensional</span>
                  <button
                    onClick={() => {
                      if (onUpdateSlide) {
                        onUpdateSlide({
                          ...activeSlide,
                          imageUrl: undefined,
                          imageLayout: "none"
                        });
                      }
                    }}
                    className="text-[9px] font-black text-rose-400 hover:text-rose-300 transition"
                  >
                    Ocultar Imagem
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['card', 'side', 'background'] as const).map((lay) => {
                    const labelMap = { card: "Destaque", side: "Lateral", background: "Fundo" };
                    const isSel = (activeSlide.imageLayout || 'none') === lay;
                    return (
                      <button
                        key={lay}
                        onClick={() => {
                          if (onUpdateSlide) {
                            onUpdateSlide({
                              ...activeSlide,
                              imageLayout: lay
                            });
                          }
                        }}
                        className={`py-1.5 rounded text-[9px] font-black text-center transition ${
                          isSel
                            ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-pulse'
                            : 'bg-slate-950 text-slate-400 border border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        {labelMap[lay]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-3 animate-pulse" id="generator-status-line">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
          <p className="text-[11px] text-slate-400 font-medium">
            IA modelando lógica persuasiva e gatilhos mentais...
          </p>
        </div>
      )}
    </div>
  );
}
