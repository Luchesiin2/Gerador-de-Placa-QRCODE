import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { QRData } from '../utils/qrGenerator';
import { TextLine } from '../utils/scadGenerator';
import { Rotate3d, ZoomIn, Sun, Move } from 'lucide-react';

interface ThreePreviewProps {
  plateWidth: number;
  plateHeight: number;
  plateThickness: number;
  cornerRadius: number;
  qrData: QRData;
  qrSizeMm: number;
  qrReliefDepth: number;
  qrYOffset: number;
  reliefType: 'alto' | 'baixo';
  textReliefDepth: number;
  fontName: string;
  textLines: TextLine[];
  hasBorder: boolean;
  borderWidth: number;
  borderDepth: number;
  colorBase: string;    // Base plate hex color
  colorDetails: string; // QR / Text / Border hex color
}

export interface ThreePreviewRef {
  downloadSTL: () => void;
}

const ThreePreview = forwardRef<ThreePreviewRef, ThreePreviewProps>(({
  plateWidth,
  plateHeight,
  plateThickness,
  cornerRadius,
  qrData,
  qrSizeMm,
  qrReliefDepth,
  qrYOffset,
  reliefType,
  textReliefDepth,
  fontName,
  textLines,
  hasBorder,
  borderWidth,
  borderDepth,
  colorBase,
  colorDetails,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const plateGroupRef = useRef<THREE.Group | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [loadedFont, setLoadedFont] = useState<any>(null);

  // Load 3D Font dynamically when fontName changes for high-fidelity 3D STL exporting
  useEffect(() => {
    let fontUrl = 'https://unpkg.com/three@0.150.0/examples/fonts/helvetiker_regular.typeface.json';
    
    const fnLower = fontName.toLowerCase();
    
    // Check for monospaced fonts
    if (
      fnLower.includes('mono') ||
      fnLower.includes('fira') ||
      fnLower.includes('jetbrains') ||
      fnLower.includes('source code') ||
      fnLower.includes('inconsolata') ||
      fnLower.includes('special elite') ||
      fnLower.includes('press start')
    ) {
      fontUrl = 'https://unpkg.com/three@0.150.0/examples/fonts/optimer_regular.typeface.json';
    } 
    // Check for serif/cursive fonts
    else if (
      fnLower.includes('serif') ||
      fnLower.includes('georgia') ||
      fnLower.includes('merriweather') ||
      fnLower.includes('lora') ||
      fnLower.includes('pt serif') ||
      fnLower.includes('cinzel') ||
      fnLower.includes('times') ||
      fnLower.includes('sacramento') ||
      fnLower.includes('great vibes') ||
      fnLower.includes('dancing') ||
      fnLower.includes('alex brush') ||
      fnLower.includes('pacifico') ||
      fnLower.includes('caveat')
    ) {
      fontUrl = 'https://unpkg.com/three@0.150.0/examples/fonts/gentilis_regular.typeface.json';
    } 
    // Check for high-impact display bold fonts
    else if (
      fnLower.includes('impact') ||
      fnLower.includes('bebas') ||
      fnLower.includes('anton') ||
      fnLower.includes('archivo') ||
      fnLower.includes('permanent') ||
      fnLower.includes('righteous') ||
      fnLower.includes('fredoka') ||
      fnLower.includes('creepster') ||
      fnLower.includes('black') ||
      fnLower.includes('acme') ||
      fnLower.includes('comfortaa') ||
      fnLower.includes('lobster')
    ) {
      fontUrl = 'https://unpkg.com/three@0.150.0/examples/fonts/helvetiker_bold.typeface.json';
    }

    const loader = new FontLoader();
    loader.load(
      fontUrl,
      (font) => {
        setLoadedFont(font);
      },
      undefined,
      (err) => {
        console.warn('Erro ao carregar fonte 3D via CDN. O STL usará extrusões simplificadas.', err);
      }
    );
  }, [fontName]);

  // Expose downloadSTL method to parent
  useImperativeHandle(ref, () => ({
    downloadSTL() {
      if (!plateGroupRef.current) return;
      
      const exporter = new STLExporter();
      // Export as binary STL (smaller size, fast loading for slice softwares)
      const stlResult = exporter.parse(plateGroupRef.current, { binary: true });
      
      const blob = new Blob([stlResult], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `placa_com_qrcode.stl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#101115'); // Neutral dark backing matching our dashboard

    // 2. Camera Setup
    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    
    // Position camera diagonally looking down at the plate
    const maxDim = Math.max(plateWidth, plateHeight);
    camera.position.set(0, -maxDim * 1.2, maxDim * 1.2);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear old canvases
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls Setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't orbit below ground/plate level
    controls.minDistance = 30;
    controls.maxDistance = 400;
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Key light (casting nice shadows)
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.82);
    dirLight1.position.set(60, 100, 150);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.camera.near = 10;
    dirLight1.shadow.camera.far = 500;
    const d = Math.max(plateWidth, plateHeight) * 1.2;
    dirLight1.shadow.camera.left = -d;
    dirLight1.shadow.camera.right = d;
    dirLight1.shadow.camera.top = d;
    dirLight1.shadow.camera.bottom = -d;
    dirLight1.shadow.bias = -0.0005;
    scene.add(dirLight1);

    // Soft backing accent light
    const dirLight2 = new THREE.DirectionalLight(0xaabbff, 0.45);
    dirLight2.position.set(-80, -100, 50);
    scene.add(dirLight2);

    // Ground plane representing a generic dark grid background
    const gridHelper = new THREE.GridHelper(400, 40, '#2d3748', '#1a202c');
    gridHelper.position.z = -plateThickness / 2 - 0.1;
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // 6. Create elements group
    const plateGroup = new THREE.Group();
    plateGroupRef.current = plateGroup;
    scene.add(plateGroup);

    // Helper functions for creating standard extrusions
    const createRoundedRectShape = (w: number, h: number, r: number) => {
      const shape = new THREE.Shape();
      const radius = Math.min(r, Math.min(w, h) / 2);
      
      const x = -w / 2;
      const y = -h / 2;
      
      if (radius <= 0) {
        shape.moveTo(x, y);
        shape.lineTo(x + w, y);
        shape.lineTo(x + w, y + h);
        shape.lineTo(x, y + h);
        shape.closePath();
      } else {
        shape.moveTo(x + radius, y);
        shape.lineTo(x + w - radius, y);
        shape.quadraticCurveTo(x + w, y, x + w, y + radius);
        shape.lineTo(x + w, y + h - radius);
        shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        shape.lineTo(x + radius, y + h);
        shape.quadraticCurveTo(x, y + h, x, y + h - radius);
        shape.lineTo(x, y + radius);
        shape.quadraticCurveTo(x, y, x + radius, y);
        shape.closePath();
      }
      return shape;
    };

    // Material definitions
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorBase),
      roughness: 0.45,
      metalness: 0.05,
    });

    const detailsMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorDetails),
      roughness: 0.35,
      metalness: 0.1,
    });

    // 1. Render Base Plate Mesh
    const extrusionSettingsBase = {
      depth: plateThickness,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.3,
      bevelThickness: 0.3,
    };
    
    const plateShape = createRoundedRectShape(plateWidth, plateHeight, cornerRadius);
    const baseGeometry = new THREE.ExtrudeGeometry(plateShape, extrusionSettingsBase);
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    
    // Position base mesh so its top surface sits at z = plateThickness / 2
    baseMesh.position.z = -plateThickness / 2;
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    plateGroup.add(baseMesh);

    // 2. Render Raised Border
    if (hasBorder && borderWidth > 0) {
      const borderOuterShape = createRoundedRectShape(plateWidth, plateHeight, cornerRadius);
      const borderInnerShape = createRoundedRectShape(
        plateWidth - borderWidth * 2,
        plateHeight - borderWidth * 2,
        Math.max(0.1, cornerRadius - borderWidth)
      );
      
      // Subtract inner hollow from outer shape
      borderOuterShape.holes.push(borderInnerShape);
      
      const borderExtrusionSettings = {
        depth: borderDepth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.1,
        bevelThickness: 0.1,
      };
      
      const borderGeometry = new THREE.ExtrudeGeometry(borderOuterShape, borderExtrusionSettings);
      const borderMesh = new THREE.Mesh(borderGeometry, detailsMaterial);
      
      // Position border on top of base plate
      borderMesh.position.z = reliefType === 'alto' 
        ? (plateThickness / 2) 
        : (plateThickness / 2 - borderDepth);
        
      borderMesh.castShadow = true;
      borderMesh.receiveShadow = true;
      plateGroup.add(borderMesh);
    }

    // 3. Render QR Code (Modules level)
    const qrMatrixSize = qrData.size;
    const modSize = qrSizeMm / qrMatrixSize;
    const qvZ = reliefType === 'alto' ? qrReliefDepth : -qrReliefDepth;
    
    const qrGroup = new THREE.Group();
    // Offset QR on Z appropriately
    qrGroup.position.set(0, qrYOffset, reliefType === 'alto' 
      ? (plateThickness / 2 + qrReliefDepth / 2) 
      : (plateThickness / 2 - qrReliefDepth / 2)
    );

    // Standard box for single QR pixel
    const pixelGeometry = new THREE.BoxGeometry(modSize, modSize, qrReliefDepth);
    
    for (let r = 0; r < qrMatrixSize; r++) {
      for (let c = 0; c < qrMatrixSize; c++) {
        if (qrData.matrix && qrData.matrix[r] && qrData.matrix[r][c] === 1) {
          const pixelMesh = new THREE.Mesh(pixelGeometry, detailsMaterial);
          // Calculate positions centering the QR Code
          const px = (c - (qrMatrixSize - 1) / 2) * modSize;
          const py = ((qrMatrixSize - 1) / 2 - r) * modSize;
          pixelMesh.position.set(px, py, 0);
          pixelMesh.castShadow = true;
          pixelMesh.receiveShadow = true;
          qrGroup.add(pixelMesh);
        }
      }
    }
    plateGroup.add(qrGroup);

    // 4. Render Text Lines (Either dynamically via 3D Font or falling back to 2D texture)
    textLines.forEach((line) => {
      if (!line.text.trim()) return;

      if (loadedFont) {
        // High-precision 3D Extrusion using the Helvetiker Font loader
        const finalFontSize = line.fontSize * 0.8;

        const textGeometry = new TextGeometry(line.text, {
          font: loadedFont,
          size: finalFontSize,
          depth: textReliefDepth,
          curveSegments: 3,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1,
        });

        // Center the text geometry perfectly on X and Y
        textGeometry.computeBoundingBox();
        if (textGeometry.boundingBox) {
          const xOffset = - (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) / 2;
          const yOffset = - (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y) / 2;
          textGeometry.translate(xOffset, yOffset, 0);
        }

        const textMesh = new THREE.Mesh(textGeometry, detailsMaterial);
        
        // Position physical text on top of the plate
        const zPos = plateThickness / 2;
        textMesh.position.set(0, line.yOffset, zPos);
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;
        plateGroup.add(textMesh);
      } else {
        // Fallback: 2D texture for immediate load or if font download fails
        const textCanvas = document.createElement('canvas');
        const ctx = textCanvas.getContext('2d');
        if (ctx) {
          textCanvas.width = 1024;
          textCanvas.height = 128;

          ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = colorDetails;
          
          let parsedFont = fontName;
          if (fontName.toLowerCase().includes('sans')) {
            parsedFont = 'system-ui, sans-serif';
          } else if (fontName.toLowerCase().includes('mono')) {
            parsedFont = 'monospace';
          } else if (fontName.toLowerCase().includes('serif')) {
            parsedFont = 'Georgia, serif';
          } else if (fontName.includes(':')) {
            parsedFont = fontName.split(':')[0];
          }

          ctx.font = `bold 64px "${parsedFont}", Inter, sans-serif`;
          ctx.fillText(line.text, textCanvas.width / 2, textCanvas.height / 2);

          const texture = new THREE.CanvasTexture(textCanvas);
          texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
          texture.colorSpace = THREE.SRGBColorSpace;

          const ratio = textCanvas.width / textCanvas.height;
          const meshH = line.fontSize * 1.5;
          const meshW = meshH * ratio * 0.7;
          const actualMeshW = Math.min(meshW, plateWidth - (borderWidth * 2 + 6));

          const textGeometry = new THREE.PlaneGeometry(actualMeshW, meshH);

          const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.FrontSide,
          });

          const textMesh = new THREE.Mesh(textGeometry, mat);
          
          const zPos = reliefType === 'alto' 
            ? (plateThickness / 2 + textReliefDepth + 0.05) 
            : (plateThickness / 2 - textReliefDepth + 0.05);

          textMesh.position.set(0, line.yOffset, zPos);
          
          if (reliefType === 'baixo') {
            textMesh.position.z = plateThickness / 2 - textReliefDepth + 0.01;
            mat.color.set('#000000');
            mat.opacity = 0.85;
          }

          textMesh.castShadow = (reliefType === 'alto');
          plateGroup.add(textMesh);
        }
      }
    });

    // 7. Animation Loop
    let animationId: number;
    let rotationAngle = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Auto-rotation when activated
      if (isRotating) {
        rotationAngle += 0.007;
        plateGroup.rotation.z = rotationAngle;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [
    plateWidth,
    plateHeight,
    plateThickness,
    cornerRadius,
    qrData,
    qrSizeMm,
    qrReliefDepth,
    qrYOffset,
    reliefType,
    textReliefDepth,
    fontName,
    textLines,
    hasBorder,
    borderWidth,
    borderDepth,
    colorBase,
    colorDetails,
    isRotating
  ]);

  const resetView = () => {
    if (controlsRef.current) {
      const maxDim = Math.max(plateWidth, plateHeight);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, -maxDim * 1.25, maxDim * 1.25);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#101115] rounded-2xl overflow-hidden border border-[#2d313d]" id="three-preview-container">
      {/* Viewport Canvas */}
      <div ref={mountRef} className="w-full h-full min-h-[460px] md:min-h-[500px]" />

      {/* Control overlay overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-[#1e202b]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#3e4456] flex items-center gap-2 text-xs text-white shadow-xl">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span>Visualizador 3D Interativo</span>
        </div>
      </div>

      {/* Utility Overlay buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-[#191b24]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#3e4456] shadow-xl">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title="Auto-rotacionar modelo"
          className={`p-2 rounded-lg transition-all ${
            isRotating 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-[#282a36]'
          }`}
          id="btn-auto-rotate"
        >
          <Rotate3d size={18} className={isRotating ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={resetView}
          title="Resetar câmera original"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#282a36] transition-all"
          id="btn-reset-view"
        >
          <ZoomIn size={18} />
        </button>

        <div className="h-5 w-[1px] bg-[#3e4456]" />

        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 px-1">
          <Move size={12} />
          <span>Arraste para girar • Scroll para dar Zoom</span>
        </div>
      </div>

      {/* 3D Color Specs */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2 bg-[#191b24]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#3e4456] text-gray-300">
          <span className="w-3 h-3 rounded bg-white border border-[#3e4456]" style={{ backgroundColor: colorBase }} />
          <span>Base</span>
        </div>
        <div className="flex items-center gap-2 bg-[#191b24]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#3e4456] text-gray-300">
          <span className="w-3 h-3 rounded bg-black border border-[#3e4456]" style={{ backgroundColor: colorDetails }} />
          <span>Detalhes</span>
        </div>
      </div>
    </div>
  );
});

export default ThreePreview;
