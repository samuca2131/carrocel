import { Plus, Trash2, Copy, MoveUp, MoveDown } from "lucide-react";
import { Slide, SuggestedPalette } from "../types";

interface SlidesListProps {
  slides: Slide[];
  activeSlideId: string;
  setActiveSlideId: (id: string) => void;
  palette: SuggestedPalette;
  onAddSlide: () => void;
  onDuplicateSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (id: string, direction: 'up' | 'down') => void;
}

export default function SlidesList({
  slides,
  activeSlideId,
  setActiveSlideId,
  palette,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide
}: SlidesListProps) {
  return (
    <div className="w-48 bg-slate-950 border-r border-slate-800 flex flex-col p-4 space-y-4" id="slides-thumb-panel">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slides ({slides.length})</span>
        <button
          onClick={onAddSlide}
          className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center justify-center transition cursor-pointer"
          title="Adicionar Novo Slide"
          id="btn-add-slide"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin" id="thumbs-list-scroller">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          const slideBg = slide.customBackground || palette.background;
          const slideText = slide.customTextColor || palette.text;
          const slideAccent = slide.customPrimaryColor || palette.primary;

          return (
            <div
              key={slide.id}
              className={`p-1.5 rounded-xl border-2 transition-all duration-300 relative group flex flex-col ${
                isActive
                  ? 'border-emerald-500 bg-slate-900/60 shadow-lg shadow-emerald-500/5 scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail representation box */}
              <div
                onClick={() => setActiveSlideId(slide.id)}
                style={{ backgroundColor: slideBg }}
                className="w-full h-24 rounded-lg flex flex-col justify-between p-2 cursor-pointer shadow-inner relative overflow-hidden select-none"
              >
                {/* Visual patterns / header watermark simulation */}
                <div className="flex items-center justify-between text-[6px]" style={{ color: slideText + "88" }}>
                  <span className="truncate max-w-[60px] font-mono">WATERMARK</span>
                  <span>{index + 1}/{slides.length}</span>
                </div>

                {/* Micro centered text block */}
                <div className="flex-1 flex flex-col justify-center text-center px-1 overflow-hidden">
                  <span
                    style={{ color: slideText }}
                    className="text-[7px] leading-tight font-extrabold truncate w-full"
                  >
                    {slide.title || "Slide Sem Título"}
                  </span>
                  <span
                    style={{ color: slideAccent }}
                    className="text-[5px] uppercase mt-0.5 tracking-wider font-semibold"
                  >
                    {slide.type}
                  </span>
                </div>

                {/* Footer simulation indicator */}
                <div className="flex justify-between items-center text-[5px]" style={{ color: slideText + "66" }}>
                  <span>@handle</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: slideAccent }} />
                </div>
              </div>

              {/* Action buttons list (appears on hover or when active) */}
              <div className="flex items-center justify-between mt-1 text-slate-400 text-[10px] bg-slate-950 p-1 rounded-md">
                <div className="flex gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => onMoveSlide(slide.id, 'up')}
                    className={`p-0.5 rounded cursor-pointer ${
                      index === 0 ? 'text-slate-700' : 'hover:bg-slate-800 hover:text-slate-100'
                    }`}
                    title="Mover Para Cima"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={index === slides.length - 1}
                    onClick={() => onMoveSlide(slide.id, 'down')}
                    className={`p-0.5 rounded cursor-pointer ${
                      index === slides.length - 1 ? 'text-slate-700' : 'hover:bg-slate-800 hover:text-slate-100'
                    }`}
                    title="Mover Para Baixo"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onDuplicateSlide(slide.id)}
                    className="p-0.5 rounded hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
                    title="Duplicar Slide"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    disabled={slides.length <= 1}
                    onClick={() => onDeleteSlide(slide.id)}
                    className={`p-0.5 rounded cursor-pointer ${
                      slides.length <= 1 ? 'text-slate-700' : 'hover:bg-red-900 hover:text-red-400'
                    }`}
                    title="Deletar Slide"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
