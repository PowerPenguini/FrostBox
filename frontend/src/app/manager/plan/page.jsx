"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2, Clock, MapPin, Weight } from "lucide-react";

// --- Config ---
const CARD_W = 260;
const CARD_H = 180;
const PORT_R = 10; // promień trafienia portu (px)

// --- Helpers ---
const statusMeta = (status) => {
  switch (status) {
    case "Delivered":
      return { icon: <CheckCircle2 className="w-4 h-4" />, badge: "bg-green-100 text-green-700 border-green-200" };
    case "In Transit":
      return { icon: <Truck className="w-4 h-4" />, badge: "bg-blue-100 text-blue-700 border-blue-200" };
    default:
      return { icon: <Clock className="w-4 h-4" />, badge: "bg-gray-100 text-gray-700 border-gray-200" };
  }
};

function FreightBadge({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] border rounded-full ${m.badge}`}>
      {m.icon}
      {status}
    </span>
  );
}

function FreightCard({ freight }) {
  return (
    <Card className="relative bg-white hover:shadow-md border border-gray-200 w-full h-full transition-shadow select-none">
      {/* Ports (purely visual here, hit test robimy po pozycjach elementów) */}
      <div className="top-1/2 -left-2 absolute bg-white border border-gray-400 rounded-full w-4 h-4 -translate-y-1/2" />
      <div className="top-1/2 -right-2 absolute bg-white border border-gray-400 rounded-full w-4 h-4 -translate-y-1/2" />

      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-2 font-medium text-sm">
          <Package className="w-4 h-4 text-gray-500" />
          {freight.name}
        </CardTitle>
        <CardDescription className="text-[11px] text-gray-500">{freight.type}</CardDescription>
      </CardHeader>

      <CardContent className="p-3 pt-0 text-xs">
        <div className="flex justify-between items-center mb-2">
          <div className="inline-flex items-center gap-1 text-gray-600"><Weight className="w-3.5 h-3.5" />{freight.weight}</div>
          <FreightBadge status={freight.status} />
        </div>
        <div className="gap-2 grid grid-cols-2 mt-1">
          <div className="p-2 border rounded-lg">
            <div className="mb-0.5 text-[10px] text-gray-500">Start</div>
            <div className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5" />{freight.origin}</div>
          </div>
          <div className="p-2 border rounded-lg">
            <div className="mb-0.5 text-[10px] text-gray-500">Cel</div>
            <div className="flex items-center gap-1 font-medium"><MapPin className="w-3.5 h-3.5" />{freight.destination}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  // --- Sidebar / dragging from sidebar ---
  const [draggingCard, setDraggingCard] = useState(null);
  const [pendingDrag, setPendingDrag] = useState(null); // kliknięcie oczekujące → zamienimy w drag po progu
  const [draggingPos, setDraggingPos] = useState({ x: 0, y: 0 });
  const [sidebarFreights, setSidebarFreights] = useState([
    { id: 1, name: "Fracht A", type: "Electronics", weight: "120 kg", status: "Pending", origin: "Warszawa", destination: "Berlin" },
    { id: 2, name: "Fracht B", type: "Furniture", weight: "450 kg", status: "In Transit", origin: "Kraków", destination: "Hamburg" },
    { id: 3, name: "Fracht C", type: "Clothing", weight: "200 kg", status: "Delivered", origin: "Łódź", destination: "Praga" },
    { id: 4, name: "Fracht D", type: "Food", weight: "320 kg", status: "Pending", origin: "Poznań", destination: "Wiedeń" },
    { id: 5, name: "Fracht E", type: "Chemicals", weight: "150 kg", status: "In Transit", origin: "Katowice", destination: "Amsterdam" },
    { id: 6, name: "Fracht F", type: "Machinery", weight: "780 kg", status: "Pending", origin: "Gdańsk", destination: "Oslo" },
    { id: 7, name: "Fracht G", type: "Pharmaceuticals", weight: "95 kg", status: "Delivered", origin: "Warszawa", destination: "Wilno" },
    { id: 8, name: "Fracht H", type: "Automotive Parts", weight: "600 kg", status: "In Transit", origin: "Wrocław", destination: "Bruksela" },
    { id: 9, name: "Fracht I", type: "Paper", weight: "400 kg", status: "Pending", origin: "Szczecin", destination: "Rzym" },
    { id: 10, name: "Fracht J", type: "Textiles", weight: "210 kg", status: "Delivered", origin: "Bydgoszcz", destination: "Budapeszt" },
    { id: 11, name: "Fracht K", type: "Metals", weight: "1020 kg", status: "Pending", origin: "Lublin", destination: "Kijów" },
    { id: 12, name: "Fracht L", type: "Beverages", weight: "380 kg", status: "In Transit", origin: "Rzeszów", destination: "Zurych" },
  ]);

  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const portRefs = useRef({}); // { [rectId]: { input: ref, output: ref } }
  const sidebarDragOffset = useRef({ x: 0, y: 0 });

  // --- Canvas state ---
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [rects, setRects] = useState([]); // { id, x, y, freight }
  const [lines, setLines] = useState([]); // { fromId, toId }
  const [drawingLine, setDrawingLine] = useState(null); // { fromId, toX, toY, toId? }
  const [draggingRect, setDraggingRect] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // --- Resize canvas to wrapper ---
  useEffect(() => {
    const resize = () => {
      if (!canvasWrapperRef.current) return;
      const rect = canvasWrapperRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // --- Global mouse move for sidebar-drag preview ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (pendingDrag && !draggingCard) {
        const dx = Math.abs(e.clientX - pendingDrag.startX);
        const dy = Math.abs(e.clientY - pendingDrag.startY);
        if (dx > 5 || dy > 5) {
          setDraggingCard(pendingDrag.freight);
          sidebarDragOffset.current = { x: pendingDrag.offsetX, y: pendingDrag.offsetY };
          setDraggingPos({ x: e.clientX - pendingDrag.offsetX, y: e.clientY - pendingDrag.offsetY });
          setPendingDrag(null);
        }
      }
      if (draggingCard) {
        setDraggingPos({
          x: e.clientX - sidebarDragOffset.current.x,
          y: e.clientY - sidebarDragOffset.current.y,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [pendingDrag, draggingCard]);

  // --- Port measurements ---
  const getPortPosition = (rectId, type) => {
    const ref = portRefs.current[rectId]?.[type]?.current;
    if (!ref || !canvasWrapperRef.current) return null;
    const portRect = ref.getBoundingClientRect();
    const wrapperRect = canvasWrapperRef.current.getBoundingClientRect();
    return {
      x: portRect.left + portRect.width / 2 - wrapperRect.left,
      y: portRect.top + portRect.height / 2 - wrapperRect.top,
    };
  };

  const findPort = (x, y) => {
    for (let r of rects) {
      for (let type of ["input", "output"]) {
        const pos = getPortPosition(r.id, type);
        if (pos && Math.hypot(x - pos.x, y - pos.y) < PORT_R) return { type, rectId: r.id };
      }
    }
    return null;
  };

  // --- Canvas drawing (grid + lines) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = "#f5f6f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // dotted grid
    const dotSpacing = 40;
    ctx.fillStyle = "#cfd4db";
    for (let x = (panOffset.x % dotSpacing + dotSpacing) % dotSpacing; x < canvas.width; x += dotSpacing) {
      for (let y = (panOffset.y % dotSpacing + dotSpacing) % dotSpacing; y < canvas.height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const drawWavyLine = (from, to, color = "#6b7280") => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const offsetX = Math.abs(dx) / 2;
      const offsetY = Math.min(Math.abs(dy) / 4, 20);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.bezierCurveTo(
        from.x + offsetX,
        from.y + offsetY * Math.sign(dy || 1),
        to.x - offsetX,
        to.y - offsetY * Math.sign(dy || 1),
        to.x,
        to.y
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // existing lines
    lines.forEach(({ fromId, toId }) => {
      const from = getPortPosition(fromId, "output");
      const to = getPortPosition(toId, "input");
      if (from && to) drawWavyLine(from, to, "#4b5563");
    });

    // drawing line preview
    if (drawingLine) {
      const from = getPortPosition(drawingLine.fromId, "output");
      const to = drawingLine.toId
        ? getPortPosition(drawingLine.toId, "input")
        : { x: drawingLine.toX, y: drawingLine.toY };
      if (from && to) drawWavyLine(from, to, "#9ca3af");
    }
  }, [rects, lines, drawingLine, panOffset, canvasSize]);

  // --- Sidebar events ---
  const handleMouseDownSidebar = (e, freight) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPendingDrag({
      freight,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };
  const handleMouseUpSidebar = () => setPendingDrag(null);

  // --- Canvas events ---
  const handleMouseDownCanvas = (e) => {
    if (!canvasWrapperRef.current) return;
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // start making a connection if clicking output port
    const port = findPort(x, y);
    if (port?.type === "output") {
      setDrawingLine({ fromId: port.rectId, toX: x, toY: y });
      return;
    }

    // check if clicked on a node to drag
    const clicked = rects.find(
      (r) =>
        x >= r.x + panOffset.x &&
        x <= r.x + panOffset.x + CARD_W &&
        y >= r.y + panOffset.y &&
        y <= r.y + panOffset.y + CARD_H
    );

    if (clicked) {
      setDraggingRect(clicked.id);
      setDragOffset({ x: x - (clicked.x + panOffset.x), y: y - (clicked.y + panOffset.y) });
      return;
    }

    // otherwise start panning
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!canvasWrapperRef.current) return;
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingRect) {
      setRects((prev) =>
        prev.map((r) =>
          r.id === draggingRect
            ? { ...r, x: x - dragOffset.x - panOffset.x, y: y - dragOffset.y - panOffset.y }
            : r
        )
      );
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }

    if (drawingLine) setDrawingLine((prev) => ({ ...prev, toX: x, toY: y }));
  };

  const handleMouseUp = (e) => {
    if (!canvasWrapperRef.current) return;

    // Finish connecting line if was drawing
    if (drawingLine) {
      const wrapper = canvasWrapperRef.current.getBoundingClientRect();
      const x = e.clientX - wrapper.left;
      const y = e.clientY - wrapper.top;
      const port = findPort(x, y);
      if (port?.type === "input" && port.rectId !== drawingLine.fromId) {
        setLines((prev) => [...prev, { fromId: drawingLine.fromId, toId: port.rectId }]);
      }
    }

    // Drop from sidebar onto canvas
    if (draggingCard) {
      const wrapper = canvasWrapperRef.current.getBoundingClientRect();
      const x = e.clientX - wrapper.left - panOffset.x - sidebarDragOffset.current.x;
      const y = e.clientY - wrapper.top - panOffset.y - sidebarDragOffset.current.y;

      const id = Date.now() + Math.floor(Math.random() * 1000);
      setRects((prev) => [...prev, { id, x, y, freight: draggingCard }]);
      setSidebarFreights((prev) => prev.filter((f) => f.id !== draggingCard.id));
    }

    setDraggingCard(null);
    setPendingDrag(null);
    setDraggingRect(null);
    setDrawingLine(null);
    setIsPanning(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="z-20 box-content flex-shrink-0 bg-gray-50 p-4 border-r w-[280px] overflow-y-auto">
        <h2 className="mb-3 font-semibold text-gray-700">Lista frachtów</h2>
        {sidebarFreights.map((f) => (
          <div key={f.id} onMouseDown={(e) => handleMouseDownSidebar(e, f)} onMouseUp={handleMouseUpSidebar}>
            <div style={{ width: CARD_W, height: CARD_H }} className="mb-3 cursor-grab">
              <FreightCard freight={f} />
            </div>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasWrapperRef}
        className={`relative flex-1 w-full h-full overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="top-0 left-0 absolute w-full h-full"
        />

        {/* Nodes on canvas */}
        {rects.map((r) => {
          if (!portRefs.current[r.id])
            portRefs.current[r.id] = { input: React.createRef(), output: React.createRef() };
          const x = r.x + panOffset.x;
          const y = r.y + panOffset.y;
          return (
            <div
              key={r.id}
              style={{ position: "absolute", left: x, top: y, width: CARD_W, height: CARD_H, zIndex: 10 }}
            >
              <div className="relative">
                {/* Port refs for hit test */}
                <div ref={portRefs.current[r.id].input} className="top-1/2 -left-2 absolute bg-white border border-gray-400 rounded-full w-4 h-4 -translate-y-1/2" />
                <div ref={portRefs.current[r.id].output} className="top-1/2 -right-2 absolute bg-white border border-gray-400 rounded-full w-4 h-4 -translate-y-1/2" />
                <FreightCard freight={r.freight} />
              </div>
            </div>
          );
        })}

        {/* Dragging Card Preview (fixed, nad wszystkim) */}
        {draggingCard && (
          <div
            style={{ position: "fixed", left: draggingPos.x, top: draggingPos.y, width: CARD_W, height: CARD_H, pointerEvents: "none", zIndex: 50 }}
          >
            <FreightCard freight={draggingCard} />
          </div>
        )}
      </div>
    </div>
  );
}
