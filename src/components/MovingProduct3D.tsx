import React, { useEffect, useRef } from "react";
import { Product } from "../types";

interface MovingProduct3DProps {
  product: Product;
}

export default function MovingProduct3D({ product }: MovingProduct3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Animation angles hold
  const angleY = useRef<number>(Math.random() * 360);
  const angleX = useRef<number>(20);
  const propellerAngle = useRef<number>(0);

  // Default color hex configuration matching catalog styles
  const materialColorHex = product.customizationOptions?.colors?.[0] || "#dcfc2d";

  useEffect(() => {
    let frameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = () => {
      // Rotate automatically at a comfortable speed
      angleY.current = (angleY.current + 0.6) % 360;
      propellerAngle.current = (propellerAngle.current + 0.08) % (Math.PI * 2);

      draw();
      frameId = requestAnimationFrame(tick);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * window.devicePixelRatio || canvas.height !== h * window.devicePixelRatio) {
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      ctx.clearRect(0, 0, w, h);

      // Dark background with technical styling
      ctx.fillStyle = "#0c0d10";
      ctx.fillRect(0, 0, w, h);

      // Simple grid lines overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      const step = 15;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const cx = w / 2;
      const cy = h / 2 + 5; // offset down slightly for balance
      const radX = (angleX.current * Math.PI) / 180;
      const radY = (angleY.current * Math.PI) / 180;

      // Projection mapping projection matrix
      const project = (x3d: number, y3d: number, z3d: number) => {
        // Yaw
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const xRotY = x3d * cosY - z3d * sinY;
        const zRotY = x3d * sinY + z3d * cosY;

        // Pitch
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const yRotX = y3d * cosX - zRotY * sinX;
        const zRotX = y3d * sinX + zRotY * cosX;

        // Micro-scaling for catalog card bounds
        const scale = 0.85; 
        return {
          x: cx + xRotY * scale,
          y: cy + yRotX * scale,
          z: zRotX
        };
      };

      // Base floor shadow
      ctx.save();
      ctx.translate(cx, cy + 24);
      ctx.scale(1, 0.2);
      const floorGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
      floorGrad.addColorStop(0, "rgba(0,0,0,0.8)");
      floorGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const draw3DLine = (p1Raw: [number, number, number], p2Raw: [number, number, number], color: string, strokeW: number) => {
        const p1 = project(p1Raw[0], p1Raw[1], p1Raw[2]);
        const p2 = project(p2Raw[0], p2Raw[1], p2Raw[2]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeW;
        ctx.lineCap = "round";
        ctx.stroke();
      };

      const draw3DCircle = (ccx: number, ccy: number, ccz: number, radius: number, axis: "x" | "y" | "z", fillColor?: string, strokeColor?: string, strokeW?: number) => {
        ctx.beginPath();
        const segments = 24;
        for (let i = 0; i <= segments; i++) {
          const theta = (i * Math.PI * 2) / segments;
          let dx = 0, dy = 0, dz = 0;
          if (axis === "x") {
            dy = radius * Math.cos(theta);
            dz = radius * Math.sin(theta);
          } else if (axis === "y") {
            dx = radius * Math.cos(theta);
            dz = radius * Math.sin(theta);
          } else {
            dx = radius * Math.cos(theta);
            dy = radius * Math.sin(theta);
          }
          const p = project(ccx + dx, ccy + dy, ccz + dz);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        if (fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        if (strokeColor) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeW || 1;
          ctx.stroke();
        }
      };

      const draw3DBox = (ccx: number, ccy: number, ccz: number, bw: number, bh: number, bd: number, fillColor: string, strokeColor?: string, strokeW?: number) => {
        const hw = bw / 2;
        const hh = bh / 2;
        const hd = bd / 2;

        const vertices = [
          { x: ccx - hw, y: ccy - hh, z: ccz - hd },
          { x: ccx + hw, y: ccy - hh, z: ccz - hd },
          { x: ccx + hw, y: ccy + hh, z: ccz - hd },
          { x: ccx - hw, y: ccy + hh, z: ccz - hd },
          { x: ccx - hw, y: ccy - hh, z: ccz + hd },
          { x: ccx + hw, y: ccy - hh, z: ccz + hd },
          { x: ccx + hw, y: ccy + hh, z: ccz + hd },
          { x: ccx - hw, y: ccy + hh, z: ccz + hd }
        ];

        const faces = [
          { indices: [0, 1, 2, 3] }, // back
          { indices: [1, 5, 6, 2] }, // right
          { indices: [5, 4, 7, 6] }, // front
          { indices: [4, 0, 3, 7] }, // left
          { indices: [4, 5, 1, 0] }, // top
          { indices: [3, 2, 6, 7] }  // bottom
        ];

        const projected = vertices.map((v) => project(v.x, v.y, v.z));

        const faceDepths = faces.map((f, idx) => {
          const pts = f.indices.map((i) => projected[i]);
          const avgZ = pts.reduce((sum, p) => sum + p.z, 0) / 4;
          return { face: f, avgZ };
        });

        faceDepths.sort((a, b) => a.avgZ - b.avgZ);

        faceDepths.forEach(({ face }) => {
          ctx.beginPath();
          face.indices.forEach((idx, i) => {
            const p = projected[idx];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();

          if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeW || 1;
            ctx.stroke();
          }
        });
      };

      // ------------------------------------------------------------------------
      // SHAPES TO RENDER PER PRODUCTS
      // ------------------------------------------------------------------------
      if (product.id === "dumbbell-set") {
        // Core iron handle shaft
        draw3DLine([-16, 0, 0], [16, 0, 0], "#55585d", 6);
        draw3DLine([-15, 0, 0], [15, 0, 0], "#abb1bb", 4);

        // Modular dumbbell weights stacked together on left/right ends
        for (let i = 0; i < 3; i++) {
          const offsetL = -14 - i * 3.5;
          const offsetR = 14 + i * 3.5;
          const size = 16 + i * 2;
          draw3DCircle(offsetL, 0, 0, size, "x", materialColorHex, "rgba(255,255,255,0.15)", 1);
          draw3DCircle(offsetR, 0, 0, size, "x", materialColorHex, "rgba(255,255,255,0.15)", 1);
        }
      } 
      else if (product.id === "olympic-barbell") {
        // Heavy duty Olympic Barbell spanning canvas
        draw3DLine([-50, 0, 0], [50, 0, 0], "#44464c", 4);
        draw3DLine([-49, 0, 0], [49, 0, 0], "#d3dbdb", 2.2);

        // Plates loaded on margins
        draw3DCircle(-32, 0, 0, 18, "x", materialColorHex, "#1a1c22", 1.5);
        draw3DCircle(-35, 0, 0, 15, "x", "#FF4757", "#1a1c22", 1);
        draw3DCircle(32, 0, 0, 18, "x", materialColorHex, "#1a1c22", 1.5);
        draw3DCircle(35, 0, 0, 15, "x", "#FF4757", "#1a1c22", 1);
      } 
      else if (product.id === "smart-treadmill") {
        // Base deck footprint
        draw3DBox(0, 15, 0, 32, 4, 64, "#13151b", "rgba(255,255,255,0.08)", 1);

        // Belt runner strips
        for (let b = -25; b <= 25; b += 14) {
          const zOffset = b - Math.round((propellerAngle.current * 8) % 14);
          if (zOffset >= -28 && zOffset <= 28) {
            draw3DLine([-11, 13, zOffset], [11, 13, zOffset], "rgba(220, 252, 45, 0.22)", 1);
          }
        }

        // Left right towers and UI screen frame
        draw3DLine([-14, 15, -16], [-14, -18, -12], "#282b32", 4);
        draw3DLine([14, 15, -16], [14, -18, -12], "#282b32", 4);
        draw3DLine([-14, -18, -12], [14, -18, -12], materialColorHex, 3);

        // Console screen HUD dashboard
        draw3DBox(0, -22, -12, 18, 10, 2, "#0a0a0c", "#3e434f", 1);
      } 
      else if (product.id === "squat-rack") {
        // Squat rack power framing structure
        // Left column
        draw3DLine([-18, 22, -14], [-18, 22, 14], "#1c1e22", 4);
        draw3DLine([-18, 22, -14], [-18, -38, -14], materialColorHex, 4);
        draw3DLine([-18, 22, 14], [-18, -38, 14], materialColorHex, 4);

        // Right column
        draw3DLine([18, 22, -14], [18, 22, 14], "#1c1e22", 4);
        draw3DLine([18, 22, -14], [18, -38, -14], materialColorHex, 4);
        draw3DLine([18, 22, 14], [18, -38, 14], materialColorHex, 4);

        // Cross connects
        draw3DLine([-18, -37, -14], [18, -37, -14], "#1c1e22", 3);
        draw3DLine([-18, -37, 14], [18, -37, 14], "#2f313a", 3.5); // pull-up bar

        // Barbell supported across J-Cups
        draw3DLine([-32, -8, 14], [32, -8, 14], "#8b8fa3", 2);
        draw3DCircle(-22, -8, 14, 11, "x", "#FF4757", undefined, 1);
        draw3DCircle(22, -8, 14, 11, "x", "#FF4757", undefined, 1);
      } 
      else if (product.id === "kinetic-bike") {
        // Wind propeller bike fan
        const fanZ = -16;
        const fanY = 0;
        const radius = 18;

        // Propeller fan outer metal loop cage
        draw3DCircle(0, fanY, fanZ, radius, "x", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.15)", 1);

        // Spinning fan blades inside cage
        for (let i = 0; i < 6; i++) {
          const phi = propellerAngle.current + (i * Math.PI) / 3;
          const endY = fanY + radius * Math.sin(phi);
          const endZ = fanZ + radius * Math.cos(phi);
          draw3DLine([0, fanY, fanZ], [0, endY, endZ], materialColorHex, 1.5);
        }

        // Chassis steel frame connectors
        draw3DLine([0, 22, 18], [0, -4, 12], "#2a2d34", 4.5); // mainframe spine line
        draw3DLine([0, 22, -10], [0, 5, -16], materialColorHex, 3.5); // fork

        // Seat saddle
        draw3DBox(0, -6, 12, 7, 3, 10, "#1c1e22", undefined, 1);

        // Dual handlebars sway simulation matching rhythm
        const swing = Math.sin(propellerAngle.current) * 6;
        draw3DLine([-8, 8, -6], [-10, -18, -8 - swing], "#2f3542", 3);
        draw3DLine([8, 8, -6], [10, -18, -8 + swing], "#2f3542", 3);
      } 
      else if (product.id === "military-bench") {
        // Professional heavy gym bench
        draw3DLine([-12, 18, -24], [12, 18, -24], "#2c3e50", 4);
        draw3DLine([-12, 18, 24], [12, 18, 24], "#2c3e50", 4);
        draw3DLine([0, 18, -24], [0, 18, 24], materialColorHex, 4); // bench frame spine

        // Left angle support teeth
        draw3DBox(0, 8, -8, 3, 10, 8, "#abb1bb", undefined, 1);

        // Seat cushion pad
        draw3DBox(0, 5, 12, 11, 3.5, 16, "#1e272e", "rgba(255,255,255,0.05)", 1);

        // Incline backrest pad
        draw3DBox(0, -2, -12, 10, 3, 28, "#182026", "rgba(255,255,255,0.05)", 1);
        draw3DLine([-5, -3.6, -26], [-5, -3.6, 2], materialColorHex, 1);
        draw3DLine([5, -3.6, -26], [5, -3.6, 2], materialColorHex, 1);
      } 
      else if (product.id === "functional-cable-trainer") {
        // Left Crossover core stack tower
        draw3DBox(-20, 0, 0, 5, 34, 5, "#15171c", "rgba(255,255,255,0.1)", 1);
        // Right Crossover core stack tower
        draw3DBox(20, 0, 0, 5, 34, 5, "#15171c", "rgba(255,255,255,0.1)", 1);
        
        // Solid high-level bridge link
        draw3DLine([-20, -17, 0], [20, -17, 0], materialColorHex, 4);
        
        // Pulley wheels
        draw3DCircle(-17, -13, 0, 3.5, "z", "#e2e8f0", "#1e293b", 1);
        draw3DCircle(17, -13, 0, 3.5, "z", "#e2e8f0", "#1e293b", 1);

        // Hanging dual cables waving
        const swayFactor = Math.sin(propellerAngle.current * 1.5) * 4;
        draw3DLine([-17, -10, 0], [-13 + swayFactor, 5, 2], "rgba(255,255,255,0.6)", 1.2);
        draw3DLine([17, -10, 0], [13 - swayFactor, 5, 2], "rgba(255,255,255,0.6)", 1.2);

        // Adjustable slider handles
        draw3DBox(-13 + swayFactor, 6, 2, 2.5, 1.5, 2.5, materialColorHex, undefined, 1);
        draw3DBox(13 - swayFactor, 6, 2, 2.5, 1.5, 2.5, materialColorHex, undefined, 1);
      }
      else if (product.id === "water-rower") {
        // Dual flat row tracks
        draw3DLine([-4.5, 14, -26], [-4.5, 14, 26], "#272a30", 3);
        draw3DLine([4.5, 14, -26], [4.5, 14, 26], "#272a30", 3);

        // Circular polycarbonate fluid tank block at front
        draw3DCircle(0, 7, -18, 9, "y", "rgba(59, 130, 246, 0.2)", "#3b82f6", 1);
        
        // Fluid rotor blades inside tank spinning!
        const spinY = propellerAngle.current * 2;
        const armX1 = 7 * Math.sin(spinY);
        const armZ1 = 7 * Math.cos(spinY);
        draw3DLine([armX1, 7, -18 + armZ1], [-armX1, 7, -18 - armZ1], materialColorHex, 2);

        // Slider seat carriage which slides back and forth smoothly!
        const slideZ = Math.sin(propellerAngle.current) * 12 + 6;
        draw3DBox(0, 11, slideZ, 8, 2.5, 7, "#0f1115", "rgba(255,255,255,0.1)", 1);
        
        // Seat cushion cover
        draw3DBox(0, 9, slideZ, 7, 1.5, 6, materialColorHex, undefined, 1);
      }
      else if (product.id === "leg-press") {
        // Heavy base anchoring structural beams
        draw3DLine([-13, 19, 20], [13, 19, 20], "#171920", 5);
        draw3DLine([-13, 19, -20], [13, 19, -20], "#171920", 5);
        
        // Heavy 45 degree inclined support rails
        draw3DLine([-9, 19, 18], [-9, -2, -14], "#94a3b8", 4);
        draw3DLine([9, 19, 18], [9, -2, -14], "#94a3b8", 4);

        // Back seat supporting user at the bottom of the incline
        draw3DBox(0, 13, 13, 11, 4, 11, "#111317", "rgba(255,255,255,0.05)", 1);

        // Sliding press plate sled shifting back and forth on active 45-path
        const pressCycle = (Math.sin(propellerAngle.current) + 1.2) * 5; // offset range 1 to 11
        // Slide position formula based on identical incline:
        // Y decreases from 10 to 2 as cyclic slide goes up, Z goes from 8 to -2
        const slideY = 11 - pressCycle * 0.7;
        const slideZ = 9 - pressCycle * 0.9;

        // Press structural sled board
        draw3DBox(0, slideY, slideZ, 12, 1.5, 9, "#1f2937", undefined, 1);
        // Press target footboard colored in customization tone
        draw3DBox(0, slideY - 1.5, slideZ - 1.5, 13, 1, 8, materialColorHex, undefined, 1);

        // Side weight loading horn bars loaded with loaded red simulator plates
        draw3DLine([-17, slideY, slideZ], [17, slideY, slideZ], "#4b5563", 3);
        draw3DCircle(-15, slideY, slideZ, 5, "x", "#ef4444", "#111", 1);
        draw3DCircle(15, slideY, slideZ, 5, "x", "#ef4444", "#111", 1);
      }
      else {
        // Fallback generic rotating 3D prism shape in case of catalog expansions
        draw3DBox(0, 0, 0, 18, 18, 18, materialColorHex, "rgba(255,255,255,0.2)", 1);
      }

      // Live technical blinking indicator text overlay direct inside canvas!
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "bold 7px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText("3D ACTIVE LIVE", w - 8, h - 8);

      ctx.beginPath();
      ctx.arc(w - 74, h - 10, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = propellerAngle.current % (Math.PI / 2) > Math.PI / 4 ? materialColorHex : "rgba(255, 255, 255, 0.15)";
      ctx.fill();
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [product, materialColorHex]);

  return (
    <div className="w-full h-full relative group/canvas overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-black"
        title="Interactive 3D Preview - Double click or Click Customize for options"
      />
      <div className="absolute top-2.5 right-2.5 pointer-events-none bg-black/85 px-2 py-0.5 border border-white/5 uppercase text-[7px] font-mono tracking-widest text-[#dcfc2d] opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-300">
        Auto-Spinning 360°
      </div>
    </div>
  );
}
