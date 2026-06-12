import { QRData } from './qrGenerator';

export interface TextLine {
  text: string;
  fontSize: number;
  yOffset: number; // Vertical offset from center
}

export interface ScadParams {
  qrLink: string;
  qrData: QRData;
  reliefType: 'alto' | 'baixo'; // 'alto' = embossed/raised, 'baixo' = engraved/cavity
  plateWidth: number;
  plateHeight: number;
  plateThickness: number;
  cornerRadius: number;
  qrSizeMm: number;
  qrReliefDepth: number;
  qrYOffset: number; // Center of QR on Y axis
  textReliefDepth: number;
  fontName: string;
  textLines: TextLine[];
  hasBorder: boolean;
  borderWidth: number;
  borderDepth: number;
  colorBase: string;
  colorDetails: string;
  useLibraryQr: boolean; // If true, write 'include <qrcode.scad>' code instead of matrix
}

/**
 * Generates valid, highly optimized, and MakerWorld Customizer compatible OpenSCAD code.
 */
export function generateScadCode(params: ScadParams): string {
  const {
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
    useLibraryQr,
  } = params;

  // Format QR matrix as an OpenSCAD nested matrix array
  const formattedMatrix = qrData.matrix
    .map(row => `  [${row.join(',')}]`)
    .join(',\n');

  // Let's build the Customizer parameters section at the top of the SCAD file
  let code = `/**
 * =========================================================================
 * GERADOR DE PLACA PERSONALIZADA COM QR CODE E TEXTO
 * =========================================================================
 * Criação para impressão 3D (Compatível com MakerWorld Customizer / Bambu Lab)
 * Desenvolvido para funcionar em impressoras Multi-Color (com AMS) ou Monocromáticas (Swapping de filamento).
 * 
 * Link Codificado: ${qrLink}
 * =========================================================================
 */

/* [Dimensões Gerais da Placa] */

// Largura total da placa (mm)
plate_width = ${plateWidth}; // [30:200]

// Altura total da placa (mm)
plate_height = ${plateHeight}; // [30:300]

// Espessura da base da placa (mm)
plate_thickness = ${plateThickness}; // [1.0:0.1:10.0]

// Arredondamento dos cantos (mm) (use 0 para cantos retos)
corner_radius = ${cornerRadius}; // [0:20]

// Ativar moldura/borda externa levantada?
has_border = ${hasBorder ? 'true' : 'false'};

// Largura da moldura externa (mm)
border_width = ${borderWidth}; // [0.5:0.5:10.0]

// Altura/Espessura da moldura externa (mm)
border_depth = ${borderDepth}; // [0.2:0.1:5.0]

/* [Estilo de Impressão e Relevo] */

// Estilo de relevo para os detalhes (QR Code + Textos)
// 'alto' ideal para trocar filamento por camada ou AMS. 'baixo' ideal para gravar baixo-relevo ou preencher.
relief_style = "${reliefType}"; // [alto, baixo]

/* [Configurações do QR Code] */

// Tamanho físico do QR Code na placa (mm)
qr_size = ${qrSizeMm}; // [15:150]

// Espessura/Profundidade do QR Code (mm)
qr_depth = ${qrReliefDepth}; // [0.2:0.1:5.0]

// Posição vertical do centro do QR no plano (mm)
qr_y_offset = ${qrYOffset}; // [-100:100]

/* [Configurações do Texto] */

// Fonte do texto (deve estar disponível no sistema ou no MakerWorld)
font_name = "${fontName}"; 

// Espessura/Profundidade da extrusão dos textos (mm)
text_depth = ${textReliefDepth}; // [0.2:0.1:5.0]

`;

  // Write text parameters dynamically
  textLines.forEach((line, index) => {
    code += `// Texto da Linha ${index + 1}
text_line_${index + 1} = "${line.text.replace(/"/g, '\\"')}";
// Tamanho da fonte da Linha ${index + 1} (mm)
text_size_${index + 1} = ${line.fontSize};
// Deslocamento vertical da Linha ${index + 1} (mm)
text_y_${index + 1} = ${line.yOffset};

`;
  });

  // Include QR core or define precomputed matrix
  if (useLibraryQr) {
    code += `/* [Configuração de Biblioteca Externa] */
// Para compilação local no OpenSCAD usando o arquivo qrcode.scad
include <qrcode.scad>;
qr_text_link = "${qrLink.replace(/"/g, '\\"')}";

`;
  } else {
    code += `/* [Matriz do QR Code pré-computada] */
// Matriz gerada automaticamente de tamanho ${qrData.size}x${qrData.size}
qr_matrix_size = ${qrData.size};
qr_matrix = [
${formattedMatrix}
];

`;
  }

  code += `/* [Código do Renderizador] */
$fn = 60; // Nível de suavidade de círculos e curvas

// Executa a montagem principal da placa
main_assembly();

module main_assembly() {
    base_color() {
        if (relief_style == "bajo" || relief_style == "baixo") {
            // No modo baixo-relevo, subtraímos o QR e texto do corpo principal
            difference() {
                union() {
                    rounded_plate(plate_width, plate_height, plate_thickness, corner_radius);
                    
                    // Se houver borda, ela vai subir normalmente
                    if (has_border) {
                        translate([0, 0, plate_thickness/2 + border_depth/2])
                        border_rim(plate_width, plate_height, border_depth, corner_radius, border_width);
                    }
                }
                
                // Cavidades escaladas no Z para cortar o topo da placa
                // Subtração do QR Code
                translate([0, qr_y_offset, plate_thickness/2 - qr_depth + 0.05])
                detail_color()
                draw_qr_code(qr_depth + 0.1);
                
                // Subtração de cada linha de Texto
                translate([0, 0, plate_thickness/2 - text_depth + 0.05])
                detail_color()
                draw_all_texts(text_depth + 0.1);
            }
        } else {
            // No modo alto-relevo, renderizamos a base e adicionamos os detalhes por cima
            union() {
                rounded_plate(plate_width, plate_height, plate_thickness, corner_radius);
                
                if (has_border) {
                    translate([0, 0, plate_thickness/2 + border_depth/2])
                    border_rim(plate_width, plate_height, border_depth, corner_radius, border_width);
                }
                
                // Detalhes do QR Code elevados por cima
                translate([0, qr_y_offset, plate_thickness/2 + qr_depth/2])
                detail_color()
                draw_qr_code(qr_depth);
                
                // Detalhes do Texto elevados por cima
                translate([0, 0, plate_thickness/2 + text_depth/2])
                detail_color()
                draw_all_texts(text_depth);
            }
        }
    }
}

// Módulos Auxiliares de Visualização de Cores (Excelente para visualização e export de arquivos multi-material)
module base_color() {
    color([0.95, 0.95, 0.95]) children(); // Branco por padrão
}

module detail_color() {
    color([0.1, 0.1, 0.1]) children(); // Preto por padrão
}

// Desenha a placa com cantos arredondados suavizados
module rounded_plate(w, h, t, r) {
    if (r <= 0) {
        cube([w, h, t], center=true);
    } else {
        // Correção de segurança para garantir que o raio não ultrapasse o tamanho da placa
        validated_r = min(r, min(w, h)/2);
        
        linear_extrude(height=t, center=true)
        hull() {
            translate([-w/2 + validated_r, -h/2 + validated_r, 0]) circle(validated_r);
            translate([ w/2 - validated_r, -h/2 + validated_r, 0]) circle(validated_r);
            translate([-w/2 + validated_r,  h/2 - validated_r, 0]) circle(validated_r);
            translate([ w/2 - validated_r,  h/2 - validated_r, 0]) circle(validated_r);
        }
    }
}

// Desenha a borda alta ao redor do plano
module border_rim(w, h, depth, r, b_width) {
    difference() {
        rounded_plate(w, h, depth, r);
        rounded_plate(w - b_width*2, h - b_width*2, depth + 2, max(0.1, r - b_width));
    }
}

// Controla o desenho do QR Code de acordo com o modo de renderização
module draw_qr_code(thickness) {
    if (${useLibraryQr ? 'true' : 'false'}) {
        // Chamada da biblioteca externa qrcode.scad
        // Centralizado horizontalmente
        #translate([-qr_size/2, -qr_size/2, -thickness/2])
        linear_extrude(height=thickness)
        qrcode(qr_text_link);
    } else {
        // Renderização nativa ultra-rápida via Matriz Pré-computada (Garantido para MakerWorld)
        mod_size = qr_size / qr_matrix_size;
        
        for (r = [0 : qr_matrix_size - 1]) {
            for (c = [0 : qr_matrix_size - 1]) {
                if (qr_matrix[r][c] == 1) {
                    // Calcula coordenadas X e Y relativas ao centro
                    x = (c - (qr_matrix_size - 1)/2) * mod_size;
                    y = ((qr_matrix_size - 1)/2 - r) * mod_size; 
                    
                    // Desenha cubos de pixel com pequeno overlap de 0.05mm
                    // Isso une perfeitamente os cubos evitando problemas de fatiador 3D (Non-Manifold)
                    translate([x, y, 0])
                    cube([mod_size + 0.05, mod_size + 0.05, thickness], center=true);
                }
            }
        }
    }
}

// Renderiza todas as linhas de texto personalizado configuradas
module draw_all_texts(thickness) {
`;

  // Render text statements inside the draw_all_texts module
  textLines.forEach((_, index) => {
    code += `    // Linha ${index + 1}
    if (text_line_${index + 1} != "") {
        translate([0, text_y_${index + 1}, 0])
        linear_extrude(height=thickness, center=true)
        text(text_line_${index + 1}, size=text_size_${index + 1}, font=font_name, halign="center", valign="center");
    }
`;
  });

  code += `}
`;

  return code;
}
