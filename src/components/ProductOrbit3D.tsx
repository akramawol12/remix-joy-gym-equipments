import React, { useState, useRef, useEffect, useMemo } from "react";
import { Product } from "../types";
import {
  RotateCw,
  Settings,
  Sliders,
  Check,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Compass,
  CheckCircle,
  Lightbulb,
  Maximize2,
  Bookmark,
  ChevronRight,
  Info,
  ShoppingCart
} from "lucide-react";

interface ProductOrbit3DProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, material: string, weight?: number) => void;
  onClose: () => void;
}

interface Hotspot {
  id: string;
  title: string;
  desc: string;
  x: number;
  y: number;
  z: number;
  metric?: string;
}

export default function ProductOrbit3D({ product, onAddToCart, onClose }: ProductOrbit3DProps) {
  // Customization States
  const [selectedMaterial, setSelectedMaterial] = useState<string>(product.customizationOptions.materials[0]);
  const [selectedWeight, setSelectedWeight] = useState<number | undefined>(
    product.customizationOptions.weightSteps ? product.customizationOptions.weightSteps[4] : undefined
  );
  const [knurling, setKnurling] = useState<"Fine" | "Medium" | "Pro">("Medium");
  const [orderAdded, setOrderAdded] = useState<boolean>(false);

  // Active highlighted hotspot or spec tab
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  // Camera Playback States
  const [activePreset, setActivePreset] = useState<string>("perspective");
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [spinSpeed, setSpinSpeed] = useState<number>(0.35);

  // Canvas and Interactive drag parameters held inside dynamic performance Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera motion coordinates (linear eased interpolation)
  const angleY = useRef<number>(45); // yaw
  const angleX = useRef<number>(25); // pitch
  const zoom = useRef<number>(1.2);    // scale

  // Camera targets
  const targetAngleY = useRef<number>(45);
  const targetAngleX = useRef<number>(25);
  const targetZoom = useRef<number>(1.2);

  // Animation values incremented relative to time
  const propellerAngle = useRef<number>(0);
  const pulsePhase = useRef<number>(0);

  // Compute selected material color (matching design finishes)
  const materialColorHex = useMemo(() => {
    const idx = product.customizationOptions.materials.indexOf(selectedMaterial);
    return product.customizationOptions.colors[idx] || "#dcfc2d";
  }, [selectedMaterial, product]);

  // Pre-configured 3D hotspots mapping specs & benefits
  const hotspots = useMemo<Hotspot[]>(() => {
    const list: Record<string, Hotspot[]> = {
      "dumbbell-set": [
        { id: "grip", title: "Laser-Knurled Grip Core", desc: "Aggressive diamond knurling precision cut resists moisture and slip fatigue during high weight reps.", x: 0, y: 0, z: 0, metric: `${knurling} knurl depth` },
        { id: "collars", title: "Twist-Lock Dial", desc: "Aerospace security mechanism locks customized steel plates together instantly for seamless training.", x: 24, y: 0, z: 0, metric: "Secure safety lock" },
        { id: "plates", title: "CNC Machined Steel Weight", desc: "Perfect solid plate weight distribution calibrated to ±0.5% industrial weight variance limits.", x: -32, y: 0, z: 0, metric: `${selectedWeight || 25} lbs configuration` }
      ],
      "olympic-barbell": [
        { id: "shaft", title: "190K PSI Vault Shaft", desc: "Proprietary alloy core provides immense kinetic spring action while preserving structural integrity.", x: 0, y: 0, z: 0, metric: "190,000 PSI rating" },
        { id: "sleeves", title: "Anti-Friction Brass Bushings", desc: "Machine-cut bearing inserts enable smooth bumper rotation, fully dampening wrist rotation torque.", x: 74, y: 0, z: 0, metric: "Frictionless sleeves" },
        { id: "bumpers", title: "Acoustic Impact Rubber Bumpers", desc: "High-density vulcanized rubber safeguards standard gym floors and reduces drop noise pollution.", x: 92, y: 0, z: 0, metric: "Shore A88 Hardness" }
      ],
      "smart-treadmill": [
        { id: "console", title: "Smart UHD Telemetry Console", desc: "21.5-inch anti-glare touch dashboard delivers 120Hz live coaching telemetry and structural sync.", x: 0, y: -45, z: -25, metric: "21.5\" 120Hz display" },
        { id: "deck", title: "Adaptive Hydraulic Shock Deck", desc: "Multi-point responsive fluid shock system protects knee ligaments under weight loads up to 380 lbs.", x: 0, y: 22, z: 8, metric: "45% impact reduction" },
        { id: "motor", title: "WhisperDrive Brushless Direct Motor", desc: "Heavy-duty 4.25 HP whisper motor maintains high-torque silent velocity with automated cooling.", x: 0, y: 28, z: -46, metric: "4.25 HP continuous" }
      ],
      "squat-rack": [
        { id: "chin", title: "Wide Ergonomic Multi-Grip Bar", desc: "Provides high-traction knurling angles, custom chin-up setups and heavy suspension setups.", x: 0, y: -72, z: 28, metric: "Max load 650 lbs" },
        { id: "jcups", title: "Magnetic Lock Poly J-Cups", desc: "Rubber-lined heavy protection brackets shield paint coat finishes and absorb metal bar clangs.", x: 28, y: -10, z: 28, metric: "Heavy urethane inserts" },
        { id: "pillars", title: "11-Gauge Structural Pillars", desc: "3\" x 3\" heavy carbon steel tubes provide rigid heavy structural capacity during heavy loading.", x: -28, y: 22, z: 0, metric: "11-gauge 3x3 framing" }
      ],
      "kinetic-bike": [
        { id: "fan", title: "Alloy Wind Propeller Fan", desc: "27-inch super alloy fan rotor generates exponential air resistance matching your leg speed input.", x: 0, y: 12, z: -28, metric: "27\" Super alloy fan" },
        { id: "saddle", title: "Ergonomic Alcantara Saddle", desc: "Comfort molded memory seat equipped with 4-way steel micro-adjustment pins and rail sliders.", x: 0, y: -14, z: 24, metric: "Ergogrip Alcantara" },
        { id: "drive", title: "Gate Carbon Silent Belt", desc: "Dual stage silent belt transmission eliminates maintenance cleaning and grease stains completely.", x: 12, y: 24, z: 4, metric: "Silent CAD belt drive" }
      ],
      "military-bench": [
        { id: "wrap", title: "Carbon-Shield Sweatproof Upholstery", desc: "Heavy friction stitched vinyl wrap resists corrosive sweat and features advanced grip textures.", x: 0, y: -6, z: -16, metric: "Sweatproof composite" },
        { id: "teeth", title: "Hardened Incline Angle Sliders", desc: "9 spine angles and 3 ergonomic seat lifts secure quickly with absolute confidence locking pins.", x: 0, y: 16, z: -14, metric: "9-Back incline teeth" },
        { id: "transit", title: "Precision Polyurethanes Wheels", desc: "Mounted heavy-duty roller wheels enable quick roll rearrangement of the gym space.", x: 0, y: 32, z: 42, metric: "Rolling caster set" }
      ]
    };
    return list[product.id] || [];
  }, [product.id, knurling, selectedWeight]);

  // Setup view presets (smoothly swoop camera targets)
  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    setIsSpinning(false);
    setActiveHotspotId(null);

    switch (preset) {
      case "angle":
        targetAngleX.current = 25;
        targetAngleY.current = 45;
        targetZoom.current = 1.25;
        break;
      case "front":
        targetAngleX.current = 5;
        targetAngleY.current = 0;
        targetZoom.current = 1.2;
        break;
      case "side":
        targetAngleX.current = 10;
        targetAngleY.current = 90;
        targetZoom.current = 1.2;
        break;
      case "overhead":
        targetAngleX.current = 65;
        targetAngleY.current = -30;
        targetZoom.current = 1.15;
        break;
      case "detail":
        targetAngleX.current = 20;
        targetAngleY.current = 40;
        targetZoom.current = 1.9;
        // Auto default to first hotspot on zoom detail
        if (hotspots.length > 0) {
          setActiveHotspotId(hotspots[0].id);
        }
        break;
      default:
        break;
    }
  };

  // Zoom adjustments
  const handleZoom = (direction: "in" | "out") => {
    setIsSpinning(false);
    if (direction === "in") {
      targetZoom.current = Math.min(2.5, targetZoom.current + 0.15);
    } else {
      targetZoom.current = Math.max(0.6, targetZoom.current - 0.15);
    }
  };

  const handleHotspotClick = (hs: Hotspot) => {
    setActiveHotspotId(hs.id);
    setIsSpinning(false);

    // Dynamic swoop alignment to inspect hotspot
    targetZoom.current = 1.9;
    if (hs.id === "grip") {
      targetAngleX.current = 20;
      targetAngleY.current = 35;
    } else if (hs.id === "collars") {
      targetAngleX.current = 15;
      targetAngleY.current = 75;
    } else if (hs.id === "plates") {
      targetAngleX.current = 15;
      targetAngleY.current = -45;
    } else if (hs.id === "console") {
      targetAngleX.current = 30;
      targetAngleY.current = 15;
    } else if (hs.id === "deck") {
      targetAngleX.current = 12;
      targetAngleY.current = 65;
    } else if (hs.id === "motor") {
      targetAngleX.current = 10;
      targetAngleY.current = 115;
    } else if (hs.id === "chin") {
      targetAngleX.current = 45;
      targetAngleY.current = 35;
    } else if (hs.id === "jcups") {
      targetAngleX.current = 15;
      targetAngleY.current = 30;
    } else if (hs.id === "pillars") {
      targetAngleX.current = 22;
      targetAngleY.current = 55;
    } else if (hs.id === "fan") {
      targetAngleX.current = 10;
      targetAngleY.current = 90;
    } else if (hs.id === "saddle") {
      targetAngleX.current = 25;
      targetAngleY.current = 30;
    } else if (hs.id === "drive") {
      targetAngleX.current = 5;
      targetAngleY.current = 70;
    } else if (hs.id === "wrap") {
      targetAngleX.current = 30;
      targetAngleY.current = 35;
    } else if (hs.id === "teeth") {
      targetAngleX.current = 18;
      targetAngleY.current = 110;
    } else if (hs.id === "transit") {
      targetAngleX.current = 15;
      targetAngleY.current = -15;
    }
  };

  // Mouse inputs for manual rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setIsSpinning(false); // disable spin on drag
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Direct pixel coordinate checks for finding closest hotspot
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radX = (angleX.current * Math.PI) / 180;
    const radY = (angleY.current * Math.PI) / 180;

    // Projection calculation matching loop
    let closestHs: string | null = null;
    let minDistance = 22; // max sensitivity radius in pixels

    hotspots.forEach((hs) => {
      // Rotate around Y
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const xRotY = hs.x * cosY - hs.z * sinY;
      const zRotY = hs.x * sinY + hs.z * cosY;

      // Rotate around X
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const yRotX = hs.y * cosX - zRotY * sinX;

      const scale = 1.3 * zoom.current;
      const projX = cx + xRotY * scale;
      const projY = cy + yRotX * scale;

      const dist = Math.sqrt((mouseX - projX) ** 2 + (mouseY - projY) ** 2);
      if (dist < minDistance) {
        minDistance = dist;
        closestHs = hs.id;
      }
    });

    setHoveredHotspotId(closestHs);

    if (!isDragging.current) return;

    // Apply manual rotation delta
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    targetAngleY.current = (targetAngleY.current + dx * 0.75) % 360;
    targetAngleX.current = Math.max(-55, Math.min(80, targetAngleX.current + dy * 0.75));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredHotspotId) {
      const matched = hotspots.find((h) => h.id === hoveredHotspotId);
      if (matched) {
        handleHotspotClick(matched);
      }
    }
  };

  // Add configuration cart handler
  const handleAddToCartClick = () => {
    onAddToCart(product, 1, selectedMaterial, selectedWeight);
    setOrderAdded(true);
    setTimeout(() => setOrderAdded(false), 2000);
  };

  // Continuous animation of active propeller fan & glowing pulse phase
  useEffect(() => {
    let frameId: number;
    const tick = () => {
      pulsePhase.current = (pulsePhase.current + 0.065) % (Math.PI * 2);
      propellerAngle.current = (propellerAngle.current + 0.08) % (Math.PI * 2);

      if (isSpinning && !isDragging.current) {
        targetAngleY.current = (targetAngleY.current + spinSpeed) % 360;
      }

      // Linear interpolation to swoop camera targets softly (Grease visual effect)
      angleY.current += (targetAngleY.current - angleY.current) * 0.12;
      angleX.current += (targetAngleX.current - angleX.current) * 0.12;
      zoom.current += (targetZoom.current - zoom.current) * 0.12;

      // Force draw
      drawFrame();

      frameId = requestAnimationFrame(tick);
    };

    const drawFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Handle Device Retinal Scaling
      if (canvas.width !== w * window.devicePixelRatio || canvas.height !== h * window.devicePixelRatio) {
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      ctx.clearRect(0, 0, w, h);

      // Render Dark High Contrast Grid Studio
      const spaceGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h));
      spaceGrad.addColorStop(0, "#090a0c");
      spaceGrad.addColorStop(1, "#020202");
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, w, h);

      // Render Matrix CAD floor lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.018)";
      ctx.lineWidth = 1;
      const gridInterval = 20;
      for (let x = 0; x < w; x += gridInterval) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridInterval) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center origins
      const cx = w / 2;
      const cy = h / 2;
      const radX = (angleX.current * Math.PI) / 180;
      const radY = (angleY.current * Math.PI) / 180;

      // 3D coordinate projector
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

        const scale = 1.35 * zoom.current;
        return {
          x: cx + xRotY * scale,
          y: cy + yRotX * scale,
          z: zRotX
        };
      };

      // Perspective floor shadow disc
      ctx.save();
      ctx.translate(cx, cy + 42 * zoom.current);
      ctx.scale(1, 0.22);
      const gradShadow = ctx.createRadialGradient(0, 0, 8, 0, 0, 95 * zoom.current);
      gradShadow.addColorStop(0, "rgba(0,0,0,0.85)");
      gradShadow.addColorStop(0.5, "rgba(220,252,45,0.03)"); // faint yellow ambiance
      gradShadow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradShadow;
      ctx.beginPath();
      ctx.arc(0, 0, 95 * zoom.current, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Projector Shape Helpers
      const draw3DLine = (p1Raw: [number, number, number], p2Raw: [number, number, number], color: string, strokeW: number, cap: "round" | "butt" = "round") => {
        const p1 = project(p1Raw[0], p1Raw[1], p1Raw[2]);
        const p2 = project(p2Raw[0], p2Raw[1], p2Raw[2]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeW;
        ctx.lineCap = cap;
        ctx.stroke();
      };

      const draw3DCylinder = (p1Raw: [number, number, number], p2Raw: [number, number, number], radius: number, color: string, outlineColor?: string) => {
        const p1 = project(p1Raw[0], p1Raw[1], p1Raw[2]);
        const p2 = project(p2Raw[0], p2Raw[1], p2Raw[2]);

        if (outlineColor) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = radius * 2 + 1.5;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = radius * 2;
        ctx.lineCap = "round";
        ctx.stroke();
      };

      const draw3DCircle = (ccx: number, ccy: number, ccz: number, radius: number, axis: "x" | "y" | "z", fillColor?: string, strokeColor?: string, strokeW?: number) => {
        ctx.beginPath();
        const segments = 36;
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
          { x: ccx - hw, y: ccy - hh, z: ccz - hd }, // 0
          { x: ccx + hw, y: ccy - hh, z: ccz - hd }, // 1
          { x: ccx + hw, y: ccy + hh, z: ccz - hd }, // 2
          { x: ccx - hw, y: ccy + hh, z: ccz - hd }, // 3
          { x: ccx - hw, y: ccy - hh, z: ccz + hd }, // 4
          { x: ccx + hw, y: ccy - hh, z: ccz + hd }, // 5
          { x: ccx + hw, y: ccy + hh, z: ccz + hd }, // 6
          { x: ccx - hw, y: ccy + hh, z: ccz + hd }  // 7
        ];

        const faces = [
          { indices: [0, 1, 2, 3], norm: { x: 0, y: 0, z: -1 } }, // back
          { indices: [1, 5, 6, 2], norm: { x: 1, y: 0, z: 0 } },  // right
          { indices: [5, 4, 7, 6], norm: { x: 0, y: 0, z: 1 } },  // front
          { indices: [4, 0, 3, 7], norm: { x: -1, y: 0, z: 0 } }, // left
          { indices: [4, 5, 1, 0], norm: { x: 0, y: -1, z: 0 } }, // top
          { indices: [3, 2, 6, 7], norm: { x: 0, y: 1, z: 0 } }   // bottom
        ];

        const projected = vertices.map((v) => project(v.x, v.y, v.z));

        // Painter's sorting of faces based on center depth
        const faceDepths = faces.map((f, idx) => {
          const pts = f.indices.map((i) => projected[i]);
          const avgZ = pts.reduce((sum, p) => sum + p.z, 0) / 4;
          return { face: f, avgZ, idx };
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
      // MODEL DRAWING PIPELINE BASED ON PRODUCT ID
      // ------------------------------------------------------------------------

      if (product.id === "dumbbell-set" || product.id === "olympic-barbell") {
        const isBarbell = product.id === "olympic-barbell";
        const totalPlates = isBarbell ? 5 : Math.ceil((selectedWeight ? selectedWeight / 50 : 0.5) * 5);
        const gripRadius = isBarbell ? 5 : 85;

        // Draw handle central core
        const drawList: Array<{ depth: number; draw: () => void }> = [];

        // Main shaft shaft link
        drawList.push({
          depth: project(0, 0, 0).z,
          draw: () => {
            const len = isBarbell ? 110 : 25;
            draw3DLine([-len, 0, 0], [len, 0, 0], "#4A4D52", isBarbell ? 6 : 10);
            draw3DLine([-len + 1, 0, 0], [len - 1, 0, 0], "#D6D9DE", isBarbell ? 4 : 8);

            // Diamond Knurling dashes on grip
            ctx.save();
            ctx.strokeStyle = "rgba(0,0,0,0.35)";
            ctx.lineWidth = 0.5;
            ctx.setLineDash([2, 3]);
            const p1 = project(-len, 0, 0);
            const p2 = project(len, 0, 0);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y - (isBarbell ? 1.5 : 3));
            ctx.lineTo(p2.x, p2.y - (isBarbell ? 1.5 : 3));
            ctx.moveTo(p1.x, p1.y + (isBarbell ? 1.5 : 3));
            ctx.lineTo(p2.x, p2.y + (isBarbell ? 1.5 : 3));
            ctx.stroke();
            ctx.restore();
          }
        });

        // Sleeves collars caps
        if (isBarbell) {
          drawList.push({
            depth: project(-75, 0, 0).z,
            draw: () => draw3DLine([-115, 0, 0], [-74, 0, 0], "#EBEFF3", 10)
          });
          drawList.push({
            depth: project(75, 0, 0).z,
            draw: () => draw3DLine([74, 0, 0], [115, 0, 0], "#EBEFF3", 10)
          });
        }

        // Inner lock rings and modular plate loops
        const plateWidth = isBarbell ? 5 : 4.5;
        const baseOffset = isBarbell ? 75 : 22;

        for (let i = 0; i < totalPlates; i++) {
          const lOffset = -baseOffset - i * plateWidth;
          const rOffset = baseOffset + i * plateWidth;
          const rSize = isBarbell ? 34 - i * 1.5 : 18 + i * 2.5;

          drawList.push({
            depth: project(lOffset, 0, 0).z,
            draw: () => {
              draw3DCircle(lOffset, 0, 0, rSize, "x", materialColorHex, "rgba(255,255,255,0.15)", 1.5);
              draw3DCircle(lOffset, 0, 0, rSize - 4, "x", undefined, "rgba(0,0,0,0.25)", 1);
            }
          });

          drawList.push({
            depth: project(rOffset, 0, 0).z,
            draw: () => {
              draw3DCircle(rOffset, 0, 0, rSize, "x", materialColorHex, "rgba(255,255,255,0.15)", 1.5);
              draw3DCircle(rOffset, 0, 0, rSize - 4, "x", undefined, "rgba(0,0,0,0.25)", 1);
            }
          });
        }

        // Lock Collars
        const lockL = -baseOffset - totalPlates * plateWidth - 2;
        const lockR = baseOffset + totalPlates * plateWidth + 2;

        drawList.push({
          depth: project(lockL, 0, 0).z,
          draw: () => draw3DCircle(lockL, 0, 0, isBarbell ? 12 : 9, "x", "#9EA3AA", "#4F5257", 1)
        });
        drawList.push({
          depth: project(lockR, 0, 0).z,
          draw: () => draw3DCircle(lockR, 0, 0, isBarbell ? 12 : 9, "x", "#9EA3AA", "#4F5257", 1)
        });

        // Sort plates front-to-back and render
        drawList.sort((a, b) => a.depth - b.depth);
        drawList.forEach((el) => el.draw());

      } else if (product.id === "smart-treadmill") {
        // Render detailed modern Smart Treadmill
        // Main deck base
        draw3DBox(0, 31, 0, 48, 5, 102, "#181A22", "rgba(255,255,255,0.06)", 1);

        // Rotating deck belt speed visual strips
        const beltCenterZ = Math.round((propellerAngle.current * 10) % 36);
        for (let bOffset = -42; bOffset <= 42; bOffset += 24) {
          const zPos = bOffset - beltCenterZ;
          if (zPos >= -45 && zPos <= 45) {
            draw3DLine([-16, 28, zPos], [16, 28, zPos], "rgba(220, 252, 45, 0.28)", 1.5);
          }
        }

        // Custom metallic decorative side trims
        draw3DLine([-21, 28.2, -48], [-21, 28.2, 48], materialColorHex, 2.5);
        draw3DLine([21, 28.2, -48], [21, 28.2, 48], materialColorHex, 2.5);

        // Frame towers (upright heavy tubes)
        draw3DLine([-20, 30, -32], [-20, -32, -26], "#282C35", 7);
        draw3DLine([-20 + 0.5, 30, -32], [-19.5, -32, -26], materialColorHex, 2); // custom trim
        draw3DLine([20, 30, -32], [20, -32, -26], "#282C35", 7);
        draw3DLine([20 - 0.5, 30, -32], [19.5, -32, -26], materialColorHex, 2);

        // Loop safety handles
        draw3DLine([-20, -25, -26], [-20, -25, 20], "#4B515D", 4);
        draw3DLine([-20, -25, 20], [-20, 18, 14], "#2E323B", 4);
        draw3DLine([20, -25, -26], [20, -25, 20], "#4B515D", 4);
        draw3DLine([20, -25, 20], [20, 18, 14], "#2E323B", 4);

        // Front horizontal connector stabilizer bar
        draw3DLine([-20, -28, -26], [20, -28, -26], "#2B303A", 5);

        // UHD Active Digital Panel Screen Monitor and telemetry highlights
        draw3DBox(0, -36, -26, 32, 17, 3, "#101216", "#3E434F", 1.5);

        // Pulse LED screen active simulation line glows
        const screenP1 = project(-13, -34, -26.5);
        const screenP2 = project(13, -34, -26.5);
        ctx.strokeStyle = "#dcfc2d";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenP1.x, screenP1.y);
        ctx.lineTo(screenP2.x, screenP2.y);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 7px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        const textScrPt = project(0, -30, -27);
        ctx.fillText("JOY RUN OS 14.5 MPH", textScrPt.x, textScrPt.y);

      } else if (product.id === "squat-rack") {
        // Render Squat Rack Heavy Cage
        // Base structure
        draw3DLine([-34, 38, -38], [-34, 38, 38], "#262A33", 6);
        draw3DLine([34, 38, -38], [34, 38, 38], "#262A33", 6);
        draw3DLine([-34, 38, -36], [34, 38, -36], "#20232B", 6); // rear base

        // 4 upright framing pillars (front left, front right, back left, back right)
        // Draw back columns first, then front columns
        const drawPillar = (px: number, pz: number) => {
          draw3DBox(px, -18, pz, 5, 112, 5, materialColorHex, "rgba(255,255,255,0.06)", 1);
          // Hole adjustment heights tickers
          for (let hTick = -68; hTick <= 30; hTick += 14) {
            draw3DLine([px - 2.5, hTick, pz + 2.6], [px + 2.5, hTick, pz + 2.6], "#0A0B0E", 1);
          }
        };

        // Back Left & Back Right
        drawPillar(-32, -32);
        drawPillar(32, -32);

        // Cross connects back
        draw3DLine([-32, -73, -32], [32, -73, -32], "#20232B", 5);
        draw3DLine([-32, 28, -32], [32, 28, -32], "#20232B", 5);

        // Front Left & Front Right
        drawPillar(-32, 32);
        drawPillar(32, 32);

        // Horizontal connecting rods left and right overheads
        draw3DLine([-32, -73, -32], [-32, -73, 32], "#22252E", 5);
        draw3DLine([32, -73, -32], [32, -73, 32], "#22252E", 5);

        // Multi-angle high chinning pull-up bar
        draw3DCylinder([-32, -73, 28], [32, -73, 28], 1.8, "#4B4E54");

        // High contrast locking safe barbell resting across rack
        const barHeight = -5; // aligned to J cups
        draw3DCylinder([-82, barHeight, 28], [82, barHeight, 28], 2.2, "#E0E3E8", "rgba(0,0,0,0.5)");
        // Plates loaded on J-cup barbell sides
        draw3DCircle(-64, barHeight, 28, 18, "x", "#FF4757", "#2F3542", 1);
        draw3DCircle(-67, barHeight, 28, 16, "x", "#2F3542", "#1E222B", 1);
        draw3DCircle(64, barHeight, 28, 18, "x", "#FF4757", "#2F3542", 1);
        draw3DCircle(67, barHeight, 28, 16, "x", "#2F3542", "#1E222B", 1);

        // Urethane safety spotter bars left right
        draw3DBox(-32, 8, 14, 4, 3, 36, "#FFA502", "#D38B00");
        draw3DBox(32, 8, 14, 4, 3, 36, "#FFA502", "#D38B00");

      } else if (product.id === "kinetic-bike") {
        // Render premium Joy Kinetic Air Bike
        // Floor leveling frame base
        draw3DLine([-24, 35, -42], [24, 35, -42], "#2F3542", 6);
        draw3DLine([-24, 35, 42], [24, 35, 42], "#2F3542", 6);
        draw3DLine([0, 35, -42], [0, 35, 42], "#1E222B", 6);

        // Spinning alloy propeller fan
        const fanZ = -28;
        const fanY = 8;
        const fanRadius = 35;

        // Propeller outer metal cage
        draw3DCircle(0, fanY, fanZ, fanRadius, "x", "rgba(255,255,255,0.01)", "rgba(255,255,255,0.22)", 1.5);
        draw3DCircle(0, fanY, fanZ, fanRadius - 8, "x", undefined, "rgba(255,255,255,0.04)", 0.5);

        // Draw 8 spinning fan blades around the alloy center
        for (let i = 0; i < 8; i++) {
          const phi = propellerAngle.current + (i * Math.PI) / 4;
          const endY = fanY + (fanRadius - 2) * Math.sin(phi);
          const endZ = fanZ + (fanRadius - 2) * Math.cos(phi);
          draw3DLine([0, fanY, fanZ], [0, endY, endZ], materialColorHex, 2);
        }

        // CAD dynamic framing loops
        draw3DLine([0, 35, 30], [0, -10, 18], "#2E313D", 8); // main frame line
        draw3DLine([0, 35, -10], [0, 10, -28], materialColorHex, 6); // fork to fan
        draw3DLine([0, 35, -34], [0, 35, 34], "#2E313D", 7);

        // Seat rail support & saddle pad
        draw3DLine([0, -10, 18], [0, -22, 22], "#9EA3AC", 5); // seat adjustment neck chrome
        draw3DBox(0, -23, 22, 11, 4.5, 16, "#181A1F", "#2A2D35", 1); // seat

        // Handlebars sway out-of-phase matching propeller speed
        const armSway = Math.sin(propellerAngle.current) * 11;
        draw3DLine([-12, 18, -10], [-15, -44, -18 - armSway], "#2F3640", 5.5); // left handle
        draw3DLine([12, 18, -10], [15, -44, -18 + armSway], "#2F3640", 5.5); // right handle

      } else if (product.id === "military-bench") {
        // Render Heavy Multi-Angle Flat/Incline Bench
        // Floor cross-level steel stand
        draw3DLine([-18, 34, -44], [18, 34, -44], "#2C3E50", 6);
        draw3DLine([-18, 34, 44], [18, 34, 44], "#2C3E50", 6);
        draw3DLine([0, 34, -44], [0, 34, 44], materialColorHex, 6); // chassis core spine

        // Chrome Adjust angle teeth plates
        draw3DBox(0, 15, -12, 4.5, 20, 14, "#BDC3C7", "#7F8C8D");

        // Seat padding box details
        draw3DBox(0, 10, 24, 16, 5, 26, "#1E272E", "rgba(255,255,255,0.06)", 1);

        // Incline long backrest panel (tilted 30 degrees back nicely)
        // Center rotation of pad spine
        const padZ = -18;
        const padY = -6;
        draw3DBox(0, padY, padZ, 15, 4.5, 52, "#182026", "#2D3436", 1);

        // Custom stylish border accent piping highlighting color selection
        draw3DLine([-7.4, padY - 2.3, padZ - 26], [-7.4, padY - 2.3, padZ + 26], materialColorHex, 1.5);
        draw3DLine([7.4, padY - 2.3, padZ - 26], [7.4, padY - 2.3, padZ + 26], materialColorHex, 1.5);

        // Rolling transportation caster rollers at front
        draw3DCircle(-14, 34, 44, 4, "x", "#0F172A", undefined);
        draw3DCircle(14, 34, 44, 4, "x", "#0F172A", undefined);
      }

      // ------------------------------------------------------------------------
      // HOTSPOT CONCENTRIC GRAPHIC TARGETS OVERLAY IN THE 3D VIEWPORT
      // ------------------------------------------------------------------------

      hotspots.forEach((hs) => {
        // Map 3D coordinate point to current 2D screen translation
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const xRotY = hs.x * cosY - hs.z * sinY;
        const zRotY = hs.x * sinY + hs.z * cosY;

        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const yRotX = hs.y * cosX - zRotY * sinX;

        const scale = 1.35 * zoom.current;
        const screenX = cx + xRotY * scale;
        const screenY = cy + yRotX * scale;

        const isActive = activeHotspotId === hs.id;
        const isHovered = hoveredHotspotId === hs.id;

        // Modulate expanding outer ripple circle over time
        const pulseRadius = 8 + Math.sin(pulsePhase.current) * 4.5;

        ctx.save();
        // Glow shadows around targeted markers
        ctx.shadowColor = "#dcfc2d";
        ctx.shadowBlur = isHovered || isActive ? 12 : 5;

        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isActive || isHovered ? "rgba(220, 252, 45, 0.7)" : "rgba(220, 252, 45, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner solid hub target
        ctx.beginPath();
        ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
        ctx.fillStyle = isActive || isHovered ? "#ffffff" : "#dcfc2d";
        ctx.fill();
        ctx.restore();

        // Connected CAD Telemetry label lines drawn on hover or active selection
        if (isActive || isHovered) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(220, 252, 45, 0.8)";
          ctx.lineWidth = 1;

          // Connect from coordinate dot, draw nice diagonal telemetry stem
          const dirX = hs.x >= 0 ? 1 : -1;
          const dirY = hs.y >= 0 ? 1 : -1;
          const stemX1 = screenX + dirX * 12;
          const stemY1 = screenY + dirY * 12;
          const stemX2 = stemX1 + dirX * 22;

          ctx.moveTo(screenX, screenY);
          ctx.lineTo(stemX1, stemY1);
          ctx.lineTo(stemX2, stemY1);
          ctx.stroke();

          // Technical mini popup bubble text right inside 3D viewport canvas!
          ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
          ctx.strokeStyle = "#dcfc2d";
          ctx.lineWidth = 1;

          const boxW = 115;
          const boxH = 34;
          const boxX = stemX2 + (dirX > 0 ? 4 : -boxW - 4);
          const boxY = stemY1 - 16;

          ctx.fillRect(boxX, boxY, boxW, boxH);
          ctx.strokeRect(boxX, boxY, boxW, boxH);

          // Technical text prints inside canvas overlay
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 8px 'JetBrains Mono', monospace";
          ctx.textAlign = "left";
          ctx.fillText(hs.title.substring(0, 22), boxX + 6, boxY + 12);

          ctx.fillStyle = "#dcfc2d";
          ctx.font = "500 7px 'JetBrains Mono', monospace";
          ctx.fillText(hs.metric || "Calibrated System", boxX + 6, boxY + 24);
        }
      });
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [product, selectedMaterial, selectedWeight, knurling, spinSpeed, isSpinning, hoveredHotspotId, activeHotspotId, hotspots, materialColorHex]);

  // Read current active hotspot details
  const activeHotspot = hotspots.find((h) => h.id === activeHotspotId);

  return (
    <div id="product_orbit_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="bg-neutral-950 border border-white/10 max-w-5xl w-full overflow-hidden shadow-2xl relative grid grid-cols-1 lg:grid-cols-12 min-h-[580px] lg:h-[660px]">
        
        {/* Render Canvas/Skeuomorphic CAD screen (7 Cols) */}
        <div className="lg:col-span-7 relative h-[360px] lg:h-full bg-black/50 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
          
          {/* HUD Top panel indicators */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#dcfc2d] animate-pulse" />
              <span className="px-2.5 py-1 bg-black/95 text-[9px] font-mono font-bold text-white tracking-[0.15em] uppercase border border-white/10">
                JOY CAD 3D INTERACTIVE ENGINE v4.8
              </span>
            </div>

            {/* Orbit metrics coordinates telemetry */}
            <div className="hidden sm:flex flex-col text-right font-mono text-[8px] text-white/40">
              <span>YAW TILT: {Math.round(angleY.current)}°</span>
              <span>PITCH ANGLE: {Math.round(angleX.current)}°</span>
              <span>SCALE scalar: {zoom.current.toFixed(2)}x</span>
            </div>
          </div>

          {/* Interactive Core Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onClick={handleCanvasClick}
            className="w-full flex-grow cursor-grab active:cursor-grabbing outline-none"
            title="Drag mouse to orbit. Hover / click targets to highlight tech specs."
          />

          {/* Custom CAD telemetry view controls toolbar */}
          <div className="p-4 bg-black/80 border-t border-white/5 backdrop-blur-md z-10 flex flex-wrap gap-2 items-center justify-between">
            {/* Presets Grid */}
            <div className="flex gap-1">
              {(["angle", "front", "side", "overhead", "detail"] as const).map((preset) => (
                <button
                  id={`preset_cam_${preset}`}
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest border transition-all ${
                    activePreset === preset
                      ? "bg-[#dcfc2d] text-black border-[#dcfc2d]"
                      : "bg-neutral-900 text-white/50 border-white/5 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Sim Speed & Orbit control playback */}
            <div className="flex items-center gap-3">
              {/* Zoom Buttons */}
              <div className="flex gap-1 border border-white/5 bg-neutral-900 p-0.5">
                <button
                  id="btn_zoom_out"
                  onClick={() => handleZoom("out")}
                  className="px-2 py-1 hover:bg-white/5 text-white/60 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  id="btn_zoom_in"
                  onClick={() => handleZoom("in")}
                  className="px-2 py-1 hover:bg-white/5 text-white/60 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              {/* Auto Spin Toggle */}
              <button
                id="btn_spin_toggle"
                onClick={() => setIsSpinning(!isSpinning)}
                className={`p-1.5 transition-all outline-none border ${
                  isSpinning
                    ? "bg-[#dcfc2d]/10 text-[#dcfc2d] border-[#dcfc2d]/30"
                    : "bg-neutral-900 text-white/40 border-white/5 hover:text-white"
                }`}
                title={isSpinning ? "Pause Auto-Orbit" : "Resume Auto-Orbit"}
              >
                {isSpinning ? <Pause size={12} /> : <Play size={12} />}
              </button>

              {/* Spin Speed range */}
              {isSpinning && (
                <input
                  id="spin_speed_slider"
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={spinSpeed}
                  onChange={(e) => setSpinSpeed(Number(e.target.value))}
                  className="w-16 accent-[#dcfc2d] cursor-pointer"
                  title="Orbit Velocity Speed"
                />
              )}
            </div>
          </div>
        </div>

        {/* Dynamic configurations specs side sidebar (5 Cols) */}
        <div className="lg:col-span-5 p-5 md:p-8 flex flex-col justify-between bg-[#0a0a0a] overflow-y-auto">
          <div>
            
            {/* Header Product description */}
            <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
              <div>
                <span className="font-mono text-[9px] text-[#dcfc2d] font-bold uppercase tracking-[0.2em] bg-[#dcfc2d]/10 px-2 py-0.5 border border-[#dcfc2d]/20">
                  {product.category} Series
                </span>
                <h3 className="font-display font-black tracking-tighter italic uppercase text-white text-xl md:text-2xl mt-3">
                  {product.name}
                </h3>
              </div>
              
              <button
                id="close_orbit_modal"
                onClick={onClose}
                className="h-10 w-10 bg-neutral-900 border border-white/10 text-white/50 hover:text-white hover:bg-neutral-800 transition flex items-center justify-center font-bold text-xs"
                title="Exit Interactive Viewer"
              >
                ✕
              </button>
            </div>

            <p className="font-sans text-xs text-white/60 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* KEY TECHNICAL SPECS BLOCK TARGET OVERVIEW */}
            <div className="mb-6">
              <span className="block text-[10px] text-white/45 tracking-widest uppercase font-mono mb-2.5 flex items-center gap-1">
                <Compass size={12} className="text-[#dcfc2d]" /> Dynamic Tech Benchmarks
              </span>
              <div className="grid grid-cols-2 gap-2">
                {product.specifications.slice(0, 4).map((spec, i) => (
                  <div key={i} className="bg-neutral-950 p-2.5 border border-white/5 flex items-start gap-1.5">
                    <CheckCircle size={11} className="text-[#dcfc2d] shrink-0 mt-0.5" />
                    <span className="font-mono text-[10px] text-white/80 leading-tight">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC SHOWN CONTENT ACCORDING TO USER'S INTERACTION SELECTION */}
            {activeHotspot ? (
              <div className="mb-6 p-4 bg-[#dcfc2d]/5 border border-[#dcfc2d]/20 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#dcfc2d]/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[8px] tracking-[0.2em] font-black text-[#dcfc2d] uppercase">
                    ACTIVE INSPECT VIEW
                  </span>
                  <button
                    id="clear_active_hotspot"
                    onClick={() => {
                      setActiveHotspotId(null);
                      targetZoom.current = 1.25;
                    }}
                    className="font-mono text-[9px] text-[#dcfc2d] hover:underline"
                  >
                    RESET INSPECTOR
                  </button>
                </div>
                <h4 className="font-sans font-bold text-white text-xs uppercase flex items-center gap-1">
                  <Lightbulb size={12} className="text-[#dcfc2d]" /> {activeHotspot.title}
                </h4>
                <p className="font-sans text-[11px] text-white/70 leading-relaxed mt-1.5">
                  {activeHotspot.desc}
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40">Calibrated value:</span>
                  <span className="text-[#dcfc2d] font-bold">{activeHotspot.metric}</span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-neutral-950 border border-white/5 text-center text-white/40 font-sans text-[11px] leading-relaxed flex flex-col items-center py-7">
                <Bookmark size={20} className="text-white/30 mb-2" />
                <span className="block font-medium">Interactive CAD Hotspots</span>
                Click on any pulsing target in the 3D model viewport to lock coordinates, inspect professional architectural benefits & read live specifications.
              </div>
            )}

            {/* WORKSPACE PRODUCT CONFIGURATION MATRICES */}
            <div className="space-y-4 border-t border-white/5 pt-5">
              
              {/* Materials customization finish */}
              <div>
                <span className="block text-[9px] text-white/45 tracking-widest uppercase font-mono mb-2 flex items-center gap-1">
                  <Settings size={12} className="text-[#dcfc2d]" /> Structural Surface Coating
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {product.customizationOptions.materials.map((mat, idx) => {
                    const colorVal = product.customizationOptions.colors[idx] || "#A4B0BE";
                    const isSelected = selectedMaterial === mat;

                    return (
                      <button
                        id={`material_btn_${idx}`}
                        key={mat}
                        onClick={() => setSelectedMaterial(mat)}
                        className={`p-2.5 border text-left flex items-center justify-between transition-all duration-300 ${
                          isSelected
                            ? "bg-[#dcfc2d]/5 border-[#dcfc2d] text-[#dcfc2d]"
                            : "bg-neutral-900 border-white/5 hover:bg-neutral-800 text-white/70"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-sans text-xs">
                          <span
                            style={{ backgroundColor: colorVal }}
                            className="h-2.5 w-2.5 rounded-full"
                          />
                          {mat}
                        </span>
                        {isSelected && <span className="text-[10px] font-mono font-bold text-[#dcfc2d]">SELECTED</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weight selection factors if included */}
              {product.customizationOptions.weightSteps && (
                <div>
                  <span className="block text-[9px] text-white/45 tracking-widest uppercase font-mono mb-2 flex items-center gap-1">
                    <Sliders size={12} className="text-[#dcfc2d]" /> Calibrated Load Limit
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {product.customizationOptions.weightSteps.map((w) => {
                      const isWeightSelected = selectedWeight === w;
                      return (
                        <button
                          id={`weight_btn_${w}`}
                          key={w}
                          onClick={() => setSelectedWeight(w)}
                          className={`h-7 w-12 text-center font-mono text-[10px] font-bold border transition-all ${
                            isWeightSelected
                              ? "bg-white text-black border-white"
                              : "bg-neutral-900 text-white/60 border-white/5 hover:bg-neutral-800"
                          }`}
                        >
                          {w}LB
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grip laser adjustments only for core strength sets */}
              {(product.id === "dumbbell-set" || product.id === "olympic-barbell") && (
                <div>
                  <span className="block text-[9px] text-white/45 tracking-widest uppercase font-mono mb-2">
                    Diamond Knurl Precision Depth
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["Fine", "Medium", "Pro"] as const).map((knurlItem) => (
                      <button
                        id={`knurl_btn_${knurlItem}`}
                        key={knurlItem}
                        onClick={() => setKnurling(knurlItem)}
                        className={`py-1.5 text-center font-mono text-[10px] border ${
                          knurling === knurlItem
                            ? "bg-[#dcfc2d]/10 border-[#dcfc2d] text-[#dcfc2d] font-bold"
                            : "bg-neutral-900 text-white/60 border-white/5 hover:bg-neutral-800"
                        }`}
                      >
                        {knurlItem} Depth
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action configurations checkout area footer */}
          <div className="border-t border-white/10 pt-5 mt-6">
            <div className="flex justify-between items-baseline mb-4 flex-col gap-1">
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                Configuration Status:
              </span>
              <span className="font-mono font-black text-[#dcfc2d] text-xs uppercase tracking-wider">
                Elite Architectural Spec // Approved for Assembly
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                id="orbit_add_to_cart_btn"
                onClick={handleAddToCartClick}
                className={`w-full py-3.5 font-sans text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  orderAdded
                    ? "bg-emerald-500 text-white"
                    : "bg-[#dcfc2d] text-black hover:bg-[#dcfc2d]/90 shadow-[0_4px_15px_rgba(220,252,45,0.25)] active:scale-95"
                }`}
              >
                {orderAdded ? (
                  <>
                    <Check className="stroke-[2.5]" size={15} /> Added to Design Order!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} /> Add Configured Spec to Workspace Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
