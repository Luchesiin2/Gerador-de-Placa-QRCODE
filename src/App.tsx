import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Type, 
  Settings, 
  Layers, 
  Download, 
  Copy, 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Palette, 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Check, 
  ExternalLink,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import { generateQRMatrix, QRData } from './utils/qrGenerator';
import { generateScadCode, TextLine, ScadParams } from './utils/scadGenerator';
import ThreePreview from './components/ThreePreview';

// Preset colors corresponding to standard PLA filaments
const PLA_COLORS = [
  { name: 'Branco Puro', hex: '#f8fafc' },
  { name: 'Preto Matte', hex: '#18181b' },
  { name: 'Vermelho Fogo', hex: '#dc2626' },
  { name: 'Azul Cobalto', hex: '#1d4ed8' },
  { name: 'Ouro Seda', hex: '#d97706' },
  { name: 'Verde Bambu', hex: '#15803d' },
  { name: 'Laranja Neon', hex: '#ea580c' },
  { name: 'Cinza Espacial', hex: '#4b5563' },
];

export interface FontOption {
  name: string;
  value: string;
  family: string;
}

// 52 beautiful premium fonts
const AVAILABLE_FONTS: FontOption[] = [
  // --- MODERN SANS-SERIF ---
  { name: 'Inter (Padrão)', value: 'Inter:style=Bold', family: 'Inter' },
  { name: 'Roboto', value: 'Roboto:style=Bold', family: 'Roboto' },
  { name: 'Montserrat', value: 'Montserrat:style=Bold', family: 'Montserrat' },
  { name: 'Poppins', value: 'Poppins:style=Bold', family: 'Poppins' },
  { name: 'Lato', value: 'Lato:style=Bold', family: 'Lato' },
  { name: 'Open Sans', value: 'Open Sans:style=Bold', family: 'Open Sans' },
  { name: 'Oswald', value: 'Oswald:style=Bold', family: 'Oswald' },
  { name: 'Raleway', value: 'Raleway:style=Bold', family: 'Raleway' },
  { name: 'Ubuntu', value: 'Ubuntu:style=Bold', family: 'Ubuntu' },
  { name: 'Nunito', value: 'Nunito:style=Bold', family: 'Nunito' },
  { name: 'Josefin Sans', value: 'Josefin Sans:style=Bold', family: 'Josefin Sans' },
  { name: 'Quicksand', value: 'Quicksand:style=Bold', family: 'Quicksand' },
  { name: 'Comfortaa', value: 'Comfortaa:style=Bold', family: 'Comfortaa' },
  { name: 'Kanit', value: 'Kanit:style=Bold', family: 'Kanit' },
  { name: 'Signika', value: 'Signika:style=Bold', family: 'Signika' },
  { name: 'Exo 2', value: 'Exo 2:style=Bold', family: 'Exo 2' },
  { name: 'Roboto Condensed', value: 'Roboto Condensed:style=Bold', family: 'Roboto Condensed' },

  // --- ELEGANT SERIF & CLASSICS ---
  { name: 'Georgia', value: 'Georgia:style=Bold', family: 'Georgia' },
  { name: 'Playfair Display', value: 'Playfair Display:style=Bold', family: 'Playfair Display' },
  { name: 'Merriweather', value: 'Merriweather:style=Bold', family: 'Merriweather' },
  { name: 'Lora', value: 'Lora:style=Bold', family: 'Lora' },
  { name: 'PT Serif', value: 'PT Serif:style=Bold', family: 'PT Serif' },
  { name: 'Cinzel', value: 'Cinzel:style=Bold', family: 'Cinzel' },
  { name: 'Times New Roman', value: 'Times New Roman:style=Bold', family: 'Times New Roman' },

  // --- TECHNICAL MONOSPACED & CODING ---
  { name: 'JetBrains Mono', value: 'JetBrains Mono:style=Bold', family: 'JetBrains Mono' },
  { name: 'Fira Code', value: 'Fira Code:style=Bold', family: 'Fira Code' },
  { name: 'Source Code Pro', value: 'Source Code Pro:style=Bold', family: 'Source Code Pro' },
  { name: 'Space Mono', value: 'Space Mono:style=Bold', family: 'Space Mono' },
  { name: 'Inconsolata', value: 'Inconsolata:style=Bold', family: 'Inconsolata' },
  { name: 'Roboto Mono', value: 'Roboto Mono:style=Bold', family: 'Roboto Mono' },
  { name: 'Share Tech Mono', value: 'Share Tech Mono:style=Regular', family: 'Share Tech Mono' },

  // --- HANDWRITTEN, CASUAL & CURSIVE ---
  { name: 'Caveat (Manuscrita)', value: 'Caveat:style=Bold', family: 'Caveat' },
  { name: 'Pacifico (Cursiva)', value: 'Pacifico:style=Regular', family: 'Pacifico' },
  { name: 'Dancing Script', value: 'Dancing Script:style=Bold', family: 'Dancing Script' },
  { name: 'Sacramento', value: 'Sacramento:style=Regular', family: 'Sacramento' },
  { name: 'Great Vibes', value: 'Great Vibes:style=Regular', family: 'Great Vibes' },
  { name: 'Alex Brush', value: 'Alex Brush:style=Regular', family: 'Alex Brush' },
  { name: 'Satisfy', value: 'Satisfy:style=Regular', family: 'Satisfy' },
  { name: 'Courgette', value: 'Courgette:style=Regular', family: 'Courgette' },

  // --- DISPLAY, ARTISTIC & RETRO ---
  { name: 'Impact (Super Negrito)', value: 'Impact:style=Regular', family: 'Impact' },
  { name: 'Bebas Neue', value: 'Bebas Neue:style=Regular', family: 'Bebas Neue' },
  { name: 'Anton', value: 'Anton:style=Regular', family: 'Anton' },
  { name: 'Archivo Black', value: 'Archivo Black:style=Regular', family: 'Archivo Black' },
  { name: 'Cinzel Decorative', value: 'Cinzel Decorative:style=Bold', family: 'Cinzel Decorative' },
  { name: 'Permanent Marker', value: 'Permanent Marker:style=Regular', family: 'Permanent Marker' },
  { name: 'Righteous', value: 'Righteous:style=Regular', family: 'Righteous' },
  { name: 'Acme', value: 'Acme:style=Regular', family: 'Acme' },
  { name: 'Lobster', value: 'Lobster:style=Regular', family: 'Lobster' },
  { name: 'Fredoka One', value: 'Fredoka One:style=Regular', family: 'Fredoka One' },
  { name: 'Special Elite (Retro Type)', value: 'Special Elite:style=Regular', family: 'Special Elite' },
  { name: 'Creepster (Horror/Gothic)', value: 'Creepster:style=Regular', family: 'Creepster' },
  { name: 'Press Start 2P (8-Bit)', value: 'Press Start 2P:style=Regular', family: 'Press Start 2P' },
];

export default function App() {
  // --- STATE ---
  
  // Tab control: 'preview' (3D), 'guide' (printing manual)
  const [activeTab, setActiveTab] = useState<'preview' | 'guide'>('preview');

  // Ref for ThreePreview component to trigger STL download
  const threeRef = useRef<any>(null);

  // Input States
  const [qrLink, setQrLink] = useState('https://makerworld.com');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const reliefType = 'alto'; // Forced to 'alto' per user request (Removed Baixo-Relevo option)
  const [useLibraryQr, setUseLibraryQr] = useState(false); // Default to false (Self-contained) for MakerWorld compatibility
  
  // Dimensional States (mm)
  const [plateWidth, setPlateWidth] = useState(80);
  const [plateHeight, setPlateHeight] = useState(110);
  const [plateThickness, setPlateThickness] = useState(3.0);
  const [cornerRadius, setCornerRadius] = useState(4);
  const [hasBorder, setHasBorder] = useState(true);
  const [borderWidth, setBorderWidth] = useState(2.0);
  const [borderDepth, setBorderDepth] = useState(1.0);

  // QR Settings
  const [qrSizeMm, setQrSizeMm] = useState(45);
  const [qrYOffset, setQrYOffset] = useState(20);
  const [qrReliefDepth, setQrReliefDepth] = useState(1.2);

  // Text Settings
  const [fontName, setFontName] = useState('Inter:style=Bold');
  const [textReliefDepth, setTextReliefDepth] = useState(1.2);
  const [textLines, setTextLines] = useState<TextLine[]>([
    { text: 'Texto Personalizado 1', fontSize: 6.0, yOffset: -18 },
    { text: 'Texto Personalizado 2', fontSize: 5.0, yOffset: -27 },
    { text: 'Texto Personalizado 3', fontSize: 4.5, yOffset: -35 },
  ]);

  // Color selection (visual only, for the 3D preview)
  const [colorBase, setColorBase] = useState('#f8fafc'); // Default: White Base
  const [colorDetails, setColorDetails] = useState('#18181b'); // Default: Black Text/QR

  // Derived QR Matrix Data
  const [qrData, setQrData] = useState<QRData>(() => generateQRMatrix('https://makerworld.com', 'M'));

  // UI States
  const [copied, setCopied] = useState(false);
  const [presets, setPresets] = useState<string[]>([]);

  // Update QR Matrix whenever qrLink or errorCorrection changes
  useEffect(() => {
    const data = generateQRMatrix(qrLink, errorCorrection);
    setQrData(data);
  }, [qrLink, errorCorrection]);

  // Helper dynamic presets
  const applyPreset = (type: 'wifi' | 'id' | 'social') => {
    if (type === 'wifi') {
      setQrLink('WIFI:S:MinhaRedeExemplo;T:WPA;P:SenhaSecreta;;');
      setPlateWidth(90);
      setPlateHeight(105);
      setPlateThickness(2.6);
      setQrSizeMm(48);
      setQrYOffset(18);
      setTextLines([
        { text: 'CONECTAR AO WI-FI', fontSize: 6.5, yOffset: -16 },
        { text: 'REDE: MinhaRedeExemplo', fontSize: 4.5, yOffset: -25 },
        { text: 'Aponte a câmera para conectar', fontSize: 3.5, yOffset: -33 },
      ]);
    } else if (type === 'id') {
      setQrLink('https://makerworld.com/pt/u/luchesioficial');
      setPlateWidth(75);
      setPlateHeight(115);
      setPlateThickness(3.0);
      setQrSizeMm(45);
      setQrYOffset(25);
      setTextLines([
        { text: 'MAKERWORLD PERFIL', fontSize: 6.0, yOffset: -10 },
        { text: 'MODELOS EXCLUSIVOS 3D', fontSize: 4.5, yOffset: -18 },
        { text: 'SIGA E APOIE !', fontSize: 4.0, yOffset: -26 },
      ]);
    } else if (type === 'social') {
      setQrLink('https://instagram.com/seu_usuario');
      setPlateWidth(80);
      setPlateHeight(100);
      setPlateThickness(2.8);
      setQrSizeMm(42);
      setQrYOffset(18);
      setTextLines([
        { text: 'COMO IMPRIMIR 3D', fontSize: 6.0, yOffset: -15 },
        { text: 'Visite nossa página e mande DM', fontSize: 4.0, yOffset: -23 },
      ]);
    }
  };

  // Dynamic SCAD compilation string
  const scadCode = generateScadCode({
    qrLink,
    qrData,
    reliefType,
    plateWidth,
    plateHeight,
    plateThickness,
    cornerRadius,
    qrSizeMm,
    qrReliefDepth,
    qrYOffset,
    textReliefDepth,
    fontName,
    textLines,
    hasBorder,
    borderWidth,
    borderDepth,
    colorBase,
    colorDetails,
    useLibraryQr,
  });

  // Action methods
  const handleCopyCode = () => {
    navigator.clipboard.writeText(scadCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadScad = () => {
    const blob = new Blob([scadCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placa_personalizada_qr.scad`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Text List manipulation
  const handleTextChange = (index: number, val: string) => {
    const updated = [...textLines];
    updated[index].text = val;
    setTextLines(updated);
  };

  const handleFontSizeChange = (index: number, size: number) => {
    const updated = [...textLines];
    updated[index].fontSize = Number(size);
    setTextLines(updated);
  };

  const handleYOffsetChange = (index: number, y: number) => {
    const updated = [...textLines];
    updated[index].yOffset = Number(y);
    setTextLines(updated);
  };

  const addTextLine = () => {
    if (textLines.length >= 6) return; // Prevent too cluttery layout
    const lastLine = textLines[textLines.length - 1];
    const newY = lastLine ? lastLine.yOffset - 9 : -15;
    setTextLines([...textLines, { text: `LINHA ${textLines.length + 1}`, fontSize: 4.5, yOffset: newY }]);
  };

  const removeTextLine = (index: number) => {
    const filtered = textLines.filter((_, i) => i !== index);
    setTextLines(filtered);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800/80 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-xl shadow-lg shadow-blue-500/10">
              <QrCode size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                Gerador de Placa 3D SCAD com QR Code
                <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 font-medium">
                  Makerlab Fatiável
                </span>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/50 font-medium">
                  v1.2.0
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Crie um modelo 3D de placa fatiada com QR Code e baixe diretamente em .STL para fatiar e imprimir!
              </p>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-0 flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => applyPreset('wifi')}
              className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 transition"
              id="preset-wifi"
            >
              <Sparkles size={13} className="text-blue-400" />
              <span>Placa de Wi-Fi</span>
            </button>
            <button
              onClick={() => applyPreset('social')}
              className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 transition"
              id="preset-social"
            >
              <Sparkles size={13} className="text-indigo-400" />
              <span>Instagram / Site</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CUSTOMIZATION PANELS (7 Colunas em Desktop) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* TAB 1: CORE DATA CONTENT */}
          <div className="bg-[#131313] rounded-xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/30">
            <div className="p-4 bg-[#181818] border-b border-slate-800/80 flex items-center gap-2">
              <QrCode size={18} className="text-blue-500" />
              <h2 className="font-semibold text-sm text-white">1. Link & QR Code</h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Link ou Conteúdo do QR Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={qrLink}
                    onChange={(e) => setQrLink(e.target.value)}
                    placeholder="https://exemplo.com ou texto"
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    id="input-qr-link"
                  />
                  {qrLink.startsWith('http') && (
                    <span className="absolute right-3 top-3 text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded font-mono">
                      URL Válida
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Recomendado usar links curtos para manter o padrão do QR mais limpo e fácil de ler.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Correção de Erros (QR)
                  </label>
                  <select
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as any)}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                    id="select-qr-correction"
                  >
                    <option value="L">L (7% Tolerância - Baixo)</option>
                    <option value="M">M (15% Tolerância - Médio)</option>
                    <option value="Q">Q (25% Tolerância - Alto)</option>
                    <option value="H">H (30% Tolerância - Máximo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Modo do Código SCAD
                  </label>
                  <select
                    value={useLibraryQr ? 'lib' : 'self'}
                    onChange={(e) => setUseLibraryQr(e.target.value === 'lib')}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-all"
                    id="select-scad-mode"
                  >
                    <option value="self">Autossuficiente (Auto-Matriz)</option>
                    <option value="lib">Biblioteca (qrcode.scad)</option>
                  </select>
                </div>
              </div>

              {/* Tips banner about Makerworld customizer limitations */}
              {!useLibraryQr && (
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/85 flex gap-2.5 text-xs text-slate-400">
                  <Info size={15} className="text-blue-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-blue-400">Excelente para o MakerWorld:</strong> O modo autossuficiente compila a matriz binária diretamente dentro do arquivo. Isso permite que qualquer pessoa configure o texto sem precisar carregar bibliotecas externas!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TAB 2: TEXT LAYERS MANAGER */}
          <div className="bg-[#131313] rounded-xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/30">
            <div className="p-4 bg-[#181818] border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={18} className="text-blue-500" />
                <h2 className="font-semibold text-sm text-white">2. Textos Personalizados</h2>
              </div>
              <button
                onClick={addTextLine}
                disabled={textLines.length >= 6}
                className="text-xs px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white font-medium rounded-lg flex items-center gap-1 transition shadow-sm shadow-blue-600/10"
                id="btn-add-text-line"
              >
                <Plus size={14} />
                <span>Adicionar Linha</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {textLines.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  Nenhuma linha de texto activa. Clique em "Adicionar Linha" acima.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                  {textLines.map((line, index) => (
                    <div 
                      key={index} 
                      className="bg-[#181818] p-3.5 rounded-xl border border-slate-800 relative group space-y-2.5"
                      id={`text-line-item-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Linha {index + 1}
                        </span>
                        <button
                          onClick={() => removeTextLine(index)}
                          className="text-gray-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition duration-150"
                          title="Remover linha"
                          id={`btn-remove-text-${index}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        {/* Text Field */}
                        <div className="col-span-12">
                          <input
                            type="text"
                            value={line.text}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            placeholder={`Escreva aqui o texto da linha ${index + 1}`}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition-all"
                            id={`input-text-val-${index}`}
                          />
                        </div>

                        {/* Font Size Selector */}
                        <div className="col-span-6 space-y-1">
                          <label className="text-[10px] text-gray-400 block font-semibold">Tamanho (mm)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="2"
                              max="16"
                              step="0.5"
                              value={line.fontSize}
                              onChange={(e) => handleFontSizeChange(index, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              id={`slider-font-size-${index}`}
                            />
                            <span className="text-xs text-gray-300 font-mono w-10 text-right">{line.fontSize}</span>
                          </div>
                        </div>

                        {/* Y Offset / Position */}
                        <div className="col-span-6 space-y-1">
                          <label className="text-[10px] text-gray-400 block font-semibold">Posição Y (mm)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              step="1"
                              value={line.yOffset}
                              onChange={(e) => handleYOffsetChange(index, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              id={`slider-font-y-${index}`}
                            />
                            <span className="text-xs text-gray-300 font-mono w-10 text-right">{line.yOffset}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <Type size={12} className="text-blue-500" />
                    Fonte dos Textos
                  </label>
                  <select
                    value={
                      AVAILABLE_FONTS.some((f) => f.value === fontName)
                        ? fontName
                        : 'custom'
                    }
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setFontName('Arial:style=Bold');
                      } else {
                        setFontName(e.target.value);
                      }
                    }}
                    style={{
                      fontFamily: AVAILABLE_FONTS.find((f) => f.value === fontName)?.family || 'sans-serif'
                    }}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none transition-all cursor-pointer"
                    id="select-font-style"
                  >
                    {AVAILABLE_FONTS.map((font) => (
                      <option
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.family }}
                        className="bg-[#181818] text-white"
                      >
                        {font.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-[#181818] text-white font-sans">
                      ✏️ Outra (Digitar Nome)...
                    </option>
                  </select>

                  {!AVAILABLE_FONTS.some((f) => f.value === fontName) && (
                    <input
                      type="text"
                      value={fontName}
                      onChange={(e) => setFontName(e.target.value)}
                      placeholder="Ex: Arial:style=Bold"
                      className="w-full bg-[#0d0d0d] border border-blue-500/45 focus:border-blue-500 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none transition-all font-mono mt-1"
                      id="input-font-name-custom"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Espessura Texto (mm)
                  </label>
                  <input
                    type="number"
                    min="0.2"
                    max="6"
                    step="0.1"
                    value={textReliefDepth}
                    onChange={(e) => setTextReliefDepth(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition-all font-mono"
                    id="input-text-depth"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 3: DIMENSIONS & SPECS */}
          <div className="bg-[#131313] rounded-xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/30">
            <div className="p-4 bg-[#181818] border-b border-slate-800/80 flex items-center gap-2">
              <Sliders size={18} className="text-blue-500" />
              <h2 className="font-semibold text-sm text-white">3. Dimensões do Quadrado & Placa</h2>
            </div>

            <div className="p-5 space-y-4">
              {/* Plate size controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-1">
                    Largura da Placa (mm)
                  </label>
                  <input
                    type="number"
                    value={plateWidth}
                    onChange={(e) => setPlateWidth(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="input-plate-width"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-1">
                    Altura da Placa (mm)
                  </label>
                  <input
                    type="number"
                    value={plateHeight}
                    onChange={(e) => setPlateHeight(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="input-plate-height"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-1">
                    Espessura da Base (mm)
                  </label>
                  <input
                    type="number"
                    step="0.2"
                    value={plateThickness}
                    onChange={(e) => setPlateThickness(Math.max(0.4, Number(e.target.value)))}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="input-plate-thickness"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-1">
                    Raio do Canto (mm)
                  </label>
                  <input
                    type="number"
                    value={cornerRadius}
                    onChange={(e) => setCornerRadius(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="input-corner-radius"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-1">
                      Tamanho QR Code (mm)
                    </label>
                    <input
                      type="number"
                      value={qrSizeMm}
                      onChange={(e) => setQrSizeMm(Math.max(10, Number(e.target.value)))}
                      className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="input-qr-size"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-1">
                      Elevação QR Code (mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={qrReliefDepth}
                      onChange={(e) => setQrReliefDepth(Math.max(0.1, Number(e.target.value)))}
                      className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="input-qr-depth"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-400 mb-1">
                    Posicionamento Vertical do QR (Y mm)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={qrYOffset}
                      onChange={(e) => setQrYOffset(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      id="slider-qr-y"
                    />
                    <span className="text-xs font-mono text-gray-300 w-12 text-right">{qrYOffset} mm</span>
                  </div>
                </div>
              </div>

              {/* Raised rim frame controls */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-white">Moldura/Borda Externa</span>
                    <span className="text-[10px] text-gray-400">Ativa um detalhe elevado ao redor da placa</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasBorder}
                    onChange={(e) => setHasBorder(e.target.checked)}
                    className="w-5 h-5 bg-[#181818] border border-slate-800 text-blue-500 rounded cursor-pointer accent-blue-500"
                    id="checkbox-has-border"
                  />
                </div>

                {hasBorder && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">
                        Largura da Borda (mm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={borderWidth}
                        onChange={(e) => setBorderWidth(Math.max(0.1, Number(e.target.value)))}
                        className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                        id="input-border-width"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">
                        Espessura da Borda (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={borderDepth}
                        onChange={(e) => setBorderDepth(Math.max(0.1, Number(e.target.value)))}
                        className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                        id="input-border-depth"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TAB 4: PRINTING PRESETS STYLE */}
          <div className="bg-[#131313] rounded-xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/30">
            <div className="p-4 bg-[#181818] border-b border-slate-800/80 flex items-center gap-2">
              <Layers size={18} className="text-blue-500" />
              <h2 className="font-semibold text-sm text-white">4. Engenharia de Relevo & Cores</h2>
            </div>

            <div className="p-5 space-y-4">
              {/* Color Filament simulation */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Simulador de Filamento (Cores do Monitor)
                </label>
                
                <div className="space-y-3 bg-[#181818] p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block mb-1.5">Cor do Filamento Base:</span>
                    <div className="flex flex-wrap gap-2">
                      {PLA_COLORS.map((col) => (
                        <button
                           key={col.hex}
                           onClick={() => setColorBase(col.hex)}
                           className={`w-6 h-6 rounded-full border transition-all ${
                             colorBase === col.hex ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-slate-800'
                           }`}
                           style={{ backgroundColor: col.hex }}
                           title={col.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block mb-1.5">Cor do Filamento dos Detalhes / QR:</span>
                    <div className="flex flex-wrap gap-2">
                      {PLA_COLORS.map((col) => (
                        <button
                           key={col.hex}
                           onClick={() => setColorDetails(col.hex)}
                           className={`w-6 h-6 rounded-full border transition-all ${
                             colorDetails === col.hex ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-slate-800'
                           }`}
                           style={{ backgroundColor: col.hex }}
                           title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: RENDERER & CODE SCREEN PANEL (7 Colunas em Desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* TAB HEADERS FOR VIEWPANEL */}
          <div className="bg-[#131313] rounded-xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/30 flex flex-col flex-grow">
            <div className="flex bg-[#181818] border-b border-slate-800/80 justify-between items-center px-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-4.5 text-xs font-semibold tracking-wide flex items-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  id="tab-btn-preview"
                >
                  <Eye size={15} />
                  <span>Visualizar 3D Real</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-4 py-4.5 text-xs font-semibold tracking-wide flex items-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'guide'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  id="tab-btn-guide"
                >
                  <Printer size={15} />
                  <span>Instruções de Impressão</span>
                </button>
              </div>

              <div className="flex items-center gap-2 py-2 sm:py-0">
                <button
                  onClick={() => threeRef.current?.downloadSTL()}
                  className="text-xs bg-blue-600 hover:bg-blue-500 font-semibold text-white px-3.5 py-1.8 rounded-lg flex items-center gap-1.5 active:scale-95 transition shadow-sm shadow-blue-600/10 hover:shadow-blue-500/20"
                  id="btn-download-stl-header"
                >
                  <Download size={13} />
                  <span>Baixar Placa (.stl)</span>
                </button>
              </div>
            </div>

            {/* TAB CONTAINER CONTENT */}
            <div className="p-5 flex-grow bg-[#0f0f0f]">
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <ThreePreview
                    ref={threeRef}
                    plateWidth={plateWidth}
                    plateHeight={plateHeight}
                    plateThickness={plateThickness}
                    cornerRadius={cornerRadius}
                    qrData={qrData}
                    qrSizeMm={qrSizeMm}
                    qrReliefDepth={qrReliefDepth}
                    qrYOffset={qrYOffset}
                    reliefType={reliefType}
                    textReliefDepth={textReliefDepth}
                    fontName={fontName}
                    textLines={textLines}
                    hasBorder={hasBorder}
                    borderWidth={borderWidth}
                    borderDepth={borderDepth}
                    colorBase={colorBase}
                    colorDetails={colorDetails}
                  />

                  {/* Summary card below 3D preview */}
                  <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                    <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-300 space-y-1">
                      <p>
                        <strong>Dica de Interação:</strong> Arraste o modelo no visualizador 3D para examinar de todos os ângulos. Use o botão <strong>Auto-rotacionar</strong> no canto inferior direito para ver a luz refletindo nos relevos estriados.
                      </p>
                      <p className="text-gray-400">
                        Os tamanhos representam dimensões reais em milímetros. Ajuste a 'Espessura Base' e os relevos para economizar filamento!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'guide' && (
                <div className="space-y-6">
                  {/* General Banner */}
                  <div className="bg-[#181818] p-4 rounded-xl border border-slate-800 flex gap-3">
                    <Printer className="text-blue-500 shrink-0 mt-0.5" size={20} />
                    <div className="text-xs text-gray-300">
                      <h4 className="font-semibold text-white text-sm mb-1">Guia do Maker: Truques de Fatiamento</h4>
                      <p>
                        Para fazer o código QR ser facilmente legível por qualquer celular, é fundamental que haja alto contraste entre a base e o relevo (ex: Base Branca com QR Preto). Abaixo, veja as duas técnicas para imprimir isso perfeitamente.
                      </p>
                    </div>
                  </div>

                  {/* Method 1: Single Color printer (Filament Swapping) */}
                  <div className="bg-[#181818] p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</div>
                      <h4 className="font-semibold text-white text-sm">Impressão em 1 Cor (Troca manual de Filamento)</h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Você <strong>não</strong> precisa de uma impressora cara com AMS (como as Bambu Lab) ou MMU para imprimir placas coloridas perfeitas! Siga este truque simples:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                      <li>Selecione o estilo <strong className="text-white">"Alto-Relevo" (Extrudado)</strong>.</li>
                      <li>Fatie sua placa no software de fatiamento (Bambu Studio, Cura, PrusaSlicer, OrcaSlicer).</li>
                      <li>Use a barra vertical de preview de camadas e role até achar exatamente a camada onde a base termina (ex: camada de espessura {plateThickness}mm) e a extrusão do QR Code começa.</li>
                      <li>No Bambu Studio / Cura, clique com o botão direito na régua de camadas e selecione <strong>"Adicionar Pausa" (Add Pause)</strong> ou <strong>"Troca de Filamento" (Add Color Change / M600)</strong> nessa camada.</li>
                      <li>Quando a impressora pausar nesse ponto de altura, puxe o filamento base (Ex: Branco), coloque o filamento de QR (Ex: Preto) e mande continuar!</li>
                    </ul>
                  </div>

                  {/* Method 2: Multicolor Printer (Bambu AMS) */}
                  <div className="bg-[#181818] p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">2</div>
                      <h4 className="font-semibold text-white text-sm">Printers Multi-Cores (Bambu Lab AMS / Prusa MMU)</h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Se você tem um sistema AMS inteligente, o fatiamento fica automático e extremamente limpo:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
                      <li>Gere o código em <strong className="text-white">Alto-Relevo</strong> ou <strong className="text-white">Baixo-Relevo</strong>.</li>
                      <li>Importe o arquivo STL gerado para o Bambu Studio.</li>
                      <li>Use a ferramenta <strong>"Balde de Tinta" (Fill / Height Paint)</strong>.</li>
                      <li>Mude o tipo da pintura para "Camada" (Height layer) e pinte os últimos {reliefType === 'alto' ? qrReliefDepth : borderDepth}mm a partir da superfície usando a cor correspondente.</li>
                      <li>O software vai programar as trocas via AMS de forma otimizada para que apenas o topo seja impresso com o segundo filamento de detalhes, economizando descarga de filamento!</li>
                    </ul>
                  </div>

                  {/* Makerworld Publish Specs */}
                  <div className="bg-blue-950/20 p-4.5 rounded-xl border border-blue-800/30 space-y-2">
                    <h5 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase">
                      <Sparkles size={13} />
                      Como Divulgar e Hospedar no MakerWorld Customizer?
                    </h5>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Ao carregar seu modelo no MakerWorld, ative a opção <strong>"Customizer"</strong> e envie o arquivo <code className="bg-[#0a0a0a] px-1 py-0.5 rounded text-blue-400 font-mono">.scad</code> com matriz incorporada. Os servidores do Makerworld compilarão o modelo em segundos de forma interativa, permitindo aos usuários customizarem diretamente do celular ou navegador!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER WRAPPER */}
      <footer className="border-t border-slate-900 bg-[#0a0a0a] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            Desenvolvido para MakerWorld, Printables e entusiastas criativos de impressão 3D (FDM).
          </p>
          <p className="text-[11px] text-gray-600">
            A biblioteca de QR Code realiza conversões semânticas em tempo real. O OpenSCAD gerado utiliza overlaps estruturais para prevenir malhas não-manifólio.
          </p>
        </div>
      </footer>
    </div>
  );
}
