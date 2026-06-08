import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Enable JSON bodies with limit for image uploads if any
app.use(express.json({ limit: "15mb" }));

// Initialize Google GenAI Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for sending error responses
const handleError = (res: express.Response, error: any, message: string) => {
  console.error(`${message}:`, error);
  res.status(500).json({ error: message, details: error instanceof Error ? error.message : String(error) });
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Endpoint to generate carousel with slides, titles, copy, color palettes, and structural layouts
 */
app.post("/api/generate-carousel", async (req, res) => {
  try {
    const { prompt, niche, objective, targetAudience, numberOfSlides } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "O tema/prompt é obrigatório." });
    }

    const slidesCount = Math.min(Math.max(Number(numberOfSlides) || 7, 5), 30);

    const systemInstruction = `Você é um Copywriter e Especialista em Engajamento de Mídias Sociais de elite (padrão Canva, Figma e Notion).
Sua tarefa é criar carrosséis altamente persuasivos de alta conversão.
Considere as seguintes informações do usuário:
- Tema: ${prompt}
- Nicho: ${niche || "Geral/Multinicho"}
- Objetivo: ${objective || "Autoridade e Engajamento"}
- Público-Alvo: ${targetAudience || "Público Geral"}
- Quantidade de slides: Exatamente ${slidesCount} slides.

REGRAS DE CRIAÇÃO DO CARROSSEL:
1. Slide 1 (type: "cover"): Deve ser uma Capa Ultra Atrativa. Com título viral, promessa forte ou pergunta provocadora que prenda o olhar do usuário no feed. Use palavras de poder e emoção.
2. Slides do meio (type: "content", "checklist" ou "quote"): Sequência lógica de valor crescente (Storytelling, explicação prática, gatilhos mentais de reciprocidade, dor e prazer). Divida as ideias em poucas palavras por slide.
3. Último Slide (type: "cta"): CTA decisiva de alta conversão. Chamar para seguir o perfil, salvar o post, comentar uma palavra-chave com automação, ou link na bio.
4. Linguagem: Altamente persuasiva, amigável, clara, com emojis estratégicos, sem trechos chatos de texto acadêmico. Use "bullet points" curtos.
5. Cores Ideias & Identidade Visual: Defina cores adequadas para o nicho (ex: Marketing digital usa Slate/Azulado ou Coral, Finanças usa verde escuro e dourado/preto, Saúde usa cores limpas). Formule uma combinação rica de cores hexadecimal.`;

    const userPrompt = `Gere os detalhes de um carrossel de mídias sociais com exatamente ${slidesCount} slides seguindo o esquema JSON requisitado. O nicho do usuário é "${niche}".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING, description: "Identificação ou nome curto do tema do carrossel." },
            suggestedPalette: {
              type: Type.OBJECT,
              properties: {
                background: { type: Type.STRING, description: "Cor hexadecimal de fundo principal do carrossel (ex: #0F172A)" },
                text: { type: Type.STRING, description: "Cor hexadecimal do texto principal (ex: #FFFFFF, #1E293B)" },
                primary: { type: Type.STRING, description: "Cor hexadecimal de destaque/primária elegante (ex: #EF4444, #10B981, #F59E0B)" },
                fontHeading: { type: Type.STRING, description: "Fonte recomendada para títulos: 'Inter', 'Space Grotesk', 'Playfair Display' ou 'JetBrains Mono'" },
                fontBody: { type: Type.STRING, description: "Fonte recomendada para o corpo: 'Inter' ou 'JetBrains Mono'" }
              },
              required: ["background", "text", "primary", "fontHeading", "fontBody"]
            },
            slides: {
              type: Type.ARRAY,
              description: `A lista deve conter exatamente ${slidesCount} slides ordenados do início (capa) até o fim (CTA).`,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Código único ou número do slide (ex: slide-1, slide-2)" },
                  type: { type: Type.STRING, description: "Tipo de layout do slide: 'cover', 'content', 'checklist', 'quote' ou 'cta'" },
                  title: { type: Type.STRING, description: "Título principal provocativo ou de abertura do slide com emojis discretos." },
                  content: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Tópicos de conteúdo ou linhas de texto explicativo (geralmente entre 1 e 3 tópicos curtos e concisos)."
                  },
                  imagePrompt: { type: Type.STRING, description: "Prompt descritivo em inglês para buscar uma imagem conceitual ou ilustrativa relacionada." },
                  stickerIcon: { type: Type.STRING, description: "Nome em inglês de um ícone ideal do catálogo do Lucide (exemplos: 'target', 'trending-up', 'check-circle', 'lightbulb', 'star', 'alert-triangle', 'help-circle' ou 'award')." },
                  captionText: { type: Type.STRING, description: "Uma frase secundária curta para rodapé ou destaque no slide." }
                },
                required: ["id", "type", "title", "content", "imagePrompt", "stickerIcon"]
              }
            }
          },
          required: ["theme", "suggestedPalette", "slides"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    res.json(data);
  } catch (error) {
    handleError(res, error, "Falha ao gerar o carrossel usando IA");
  }
});

/**
 * Endpoint to rewrite, expand, or summarize text segments using instruction commands
 */
app.post("/api/rewrite-slide", async (req, res) => {
  try {
    const { title, content, type, action, niche } = req.body;

    if (!title && (!content || content.length === 0)) {
      return res.status(400).json({ error: "Título ou corpo de texto é necessário para reescrita." });
    }

    const contentStr = Array.isArray(content) ? content.join("\n") : content || "";

    const userInstructions = `Dado o texto de mídia social a seguir do nicho "${niche || "Geral"}":
Título: "${title}"
Conteúdo: "${contentStr}"
Tipo de Slide: "${type || "content"}"

AÇÃO EXIGIDA: Reescrever este texto realizando: "${action}".
Opções de ação:
- 'rewrite': Reescrever de forma mais criativa, chamativa e viral.
- 'expand': Expandir o texto adicionando insights ou transformando em tópicos de fácil leitura.
- 'summarize': Resumir de forma direta e extremamente objetiva para caber no slide.
- 'professional': Mudar o tom para mais corporativo e autoritativo.
- 'viral-hook': Fazer o título ficar 10x mais instigante ou polêmico para gerar cliques imediatos.

Retorne uma resposta JSON formatada estritamente seguindo o esquema JSON abaixo:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userInstructions,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newTitle: { type: Type.STRING, description: "Novo título de slide aprimorado com emojis" },
            newContent: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Nova lista de tópicos curtos e persuasivos (de 1 a 3 itens)."
            },
            captionText: { type: Type.STRING, description: "Frase de efeito complementar recomendada para rodapé." }
          },
          required: ["newTitle", "newContent", "captionText"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    res.json(data);
  } catch (error) {
    handleError(res, error, "Falha ao aplicar reescrita inteligente");
  }
});

/**
 * Endpoint to generate a complete Instagram/Social media caption, sales copy, and hashtags
 */
app.post("/api/generate-captions", async (req, res) => {
  try {
    const { theme, niche, slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ error: "Dados dos slides são necessários para criar a legenda." });
    }

    const slidesSummary = slides.map((s, i) => `Slide ${i + 1}: ${s.title} | ${Array.isArray(s.content) ? s.content.join("; ") : s.content}`).join("\n");

    const systemInstruction = `Você é um Copywriter Especialista em Redes Sociais.
Crie uma LEGENDA COMPLETA extremamente profissional para o post que contém este carrossel:
Tema do Carrossel: ${theme || "Geral"}
Nicho: ${niche || "Geral"}

RESUMO DOS SLIDES:
${slidesSummary}

Crie uma legenda muito atraente com:
1. Primeiro gancho (Hook): A primeira linha que gera extrema curiosidade para que o usuário clique em "ver mais".
2. Tópicos de Resumo / Aprendizado: O que o leitor ganha ao ler o post.
3. CTA Focado no Objetivo: "Comente QUERO que te envio o material", "Agende no link da Bio", ou faça uma pergunta desafiadora para aumentar comentários.
4. Bônus / Dica Secreta.
5. Hashtags de Alto Desempenho (separadas por categoria: nicho, amplo, virais).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Gere a legenda e hashtags para as redes sociais seguindo o formato de saída estruturado em JSON.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hookLine: { type: Type.STRING, description: "Uma primeira linha polêmica ou provocante para prender a atenção (Hook)." },
            captionIntro: { type: Type.STRING, description: "Introdução cativante que contextualiza a dor ou benefício do post." },
            bodyBullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 a 5 pontos de grande valor ensinados no carrossel descritos de forma persuasiva."
            },
            ctaSentence: { type: Type.STRING, description: "Chamada para ação definitiva e estratégica (Ex: Comente a palavra 'VENDER' para receber o cupom)." },
            bonusAction: { type: Type.STRING, description: "Uma dica rápida extra ou lembrete de salvamento do post (Ex: Salve para ler depois!)." },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Coleção de 10 a 15 hashtags modernas, em português, específicas para o nicho fornecido."
            }
          },
          required: ["hookLine", "captionIntro", "bodyBullets", "ctaSentence", "hashtags"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    res.json(data);
  } catch (error) {
    handleError(res, error, "Falha ao gerar legendar do carrossel");
  }
});

/**
 * Endpoint to analyze carousel virality score and render engaging engagement ratings
 */
app.post("/api/analyze-engagement", async (req, res) => {
  try {
    const { prompt, niche, slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ error: "Os slides são necessários para realizar a análise." });
    }

    const carouselText = slides.map((s, i) => `Slide ${i + 1} (${s.type}): ${s.title} | ${Array.isArray(s.content) ? s.content.join(" ") : s.content}`).join("\n");

    const systemInstruction = `Você é uma ferramenta automatizada de Inteligência de Mídia Social (Auditoria de Carrosséis).
Analise o carrossel gerado e atribua pontuações realistas/críticas de 0 a 100 baseadas nas melhores práticas de design, legibilidade de texto e copywriting profissional.
Considere o nicho "${niche || "Geral"}" e o tema "${prompt || "Geral"}".

CONTEÚDO DO CARROSSEL:
${carouselText}

Gere pontuações e recomendações detalhadas nas propriedades correspondentes no formato JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Analise o engajamento e pontuações do post em JSON.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hookScore: { type: Type.INTEGER, description: "Pontuação do título/capa contra o scrolling do feed (0 a 100)" },
            readabilityScore: { type: Type.INTEGER, description: "Pontuação de clareza textual e espaçamento (0 a 100)" },
            ctaScore: { type: Type.INTEGER, description: "Score de força da chamada final (CTA) para converter (0 a 100)" },
            retentionScore: { type: Type.INTEGER, description: "Score estimado de retenção do usuário arrastando os slides (0 a 100)" },
            overallScore: { type: Type.INTEGER, description: "Média ponderada geral das pontuações" },
            auditDetails: {
              type: Type.OBJECT,
              properties: {
                strongPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista de 2 ou 3 pontos fortes identificados no carrossel."
                },
                weakPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista de 2 ou 3 vulnerabilidades do carrossel que podem reter menos atenção."
                },
                designRecommendation: { type: Type.STRING, description: "Recomendação ideal sobre cores, fontes ou peso visual das figuras." },
                estimatedReadingTime: { type: Type.STRING, description: "Tempo estimado de leitura em segundos (Ex: '45 segundos')" }
              },
              required: ["strongPoints", "weakPoints", "designRecommendation", "estimatedReadingTime"]
            }
          },
          required: ["hookScore", "readabilityScore", "ctaScore", "retentionScore", "overallScore", "auditDetails"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    res.json(data);
  } catch (error) {
    handleError(res, error, "Falha ao realizar a análise do carrossel");
  }
});

/**
 * Endpoint to optimize an image description into a visually cohesive image generator prompt base
 */
app.post("/api/optimize-image-prompt", async (req, res) => {
  try {
    const { userDescription, carouselTheme } = req.body;
    if (!userDescription) {
      return res.status(400).json({ error: "A descrição do usuário é obrigatória." });
    }

    const systemInstruction = `Você é um Diretor de Arte Inteligente de Mídias Sociais.
Sua missão é traduzir a descrição informal de imagem dada pelo usuário em um prompt em inglês profissional, refinado e altamente descritivo para motores de geração de imagens como Imagen 3.0.
Garanta que o conceito visual final harmonize, se posicione de forma congruente e eleve o nível estético do tema do carrossel: "${carouselTheme || "Geral"}".

REGRAS DE CONSTITUIÇÃO DO PROMPT:
1. Sempre em inglês moderno e conciso.
2. Seja específico sobre o estilo visual (ex: "minimalist 3D render with soft glassmorphism", "premium clean business flat vector art", ou "high-end moody commercial workspace editorial photography").
3. Adicione referências de iluminação, profundidade de campo suave (bokeh), cores refinadas e ausência de ruído visual.
4. Não use chavões como "hyperrealistic", "photorealistic", "masterpiece" - use termos descritivos técnicos de estúdio fotográfico ou modelagem 3D.
5. Retorne SOMENTE um JSON contendo a propriedade "optimizedPrompt" estruturada.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Otimize e crie um prompt em inglês magnífico para a seguinte ideia de imagem: "${userDescription}". O tema do meu carrossel é "${carouselTheme}".`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: { type: Type.STRING, description: "O prompt final enriquecido em inglês técnico de alta qualidade." }
          },
          required: ["optimizedPrompt"]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({ optimizedPrompt: data.optimizedPrompt || userDescription });
  } catch (error) {
    handleError(res, error, "Falha ao otimizar o prompt da imagem");
  }
});

/**
 * Endpoint to generate a customized AI Image for a slide
 */
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "O prompt de imagem é obrigatório." });
    }

    const aspect = aspectRatio || "1:1";
    console.log(`[ImageGen] Iniciando geração com prompt "${prompt}" e proporção ${aspect}`);

    try {
      // 1. Try Imagen generation
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: aspect,
        },
      });

      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        const base64Bytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;
        return res.json({ imageUrl, source: "ai-imagen", prompt });
      }
    } catch (e1) {
      console.warn("[ImageGen] Falhou com Imagen-3.0, tentando com gemini-2.5-flash-image:", e1);
      
      try {
        // 2. Try gemini-2.5-flash-image
        const response2 = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [
              {
                text: prompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspect,
              imageSize: "1K"
            }
          },
        });

        const parts = response2.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData?.data) {
              const b64 = part.inlineData.data;
              const imageUrl = `data:image/png;base64,${b64}`;
              return res.json({ imageUrl, source: "ai-flash-image", prompt });
            }
          }
        }
      } catch (e2) {
        console.warn("[ImageGen] Abordagens de IA falharam. Transicionando para banco premium:", e2);
      }
    }

    // 3. Fallback premium stock photo from picsum source matching keywords
    const keywords = prompt
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length > 3)
      .slice(0, 3)
      .join("-");
    
    const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(keywords || "marketing")}/800/800`;
    return res.json({ 
      imageUrl: fallbackUrl, 
      source: "premium-stock-fallback", 
      prompt,
      message: "Utilizado banco premium de alta conversão como fallback."
    });

  } catch (error) {
    handleError(res, error, "Falha ao obter imagem para o slide");
  }
});

// ============================================================================
// VITE OR STATIC ROUTING PIPELINE
// ============================================================================

const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite development server with hot-reloading for client assets
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled assets in production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Carosséis SaaS rodando na porta http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Falha ao inicializar o servidor Express + Vite:", err);
});
