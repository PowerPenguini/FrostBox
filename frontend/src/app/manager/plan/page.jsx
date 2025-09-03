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

export default function Page() {
  const [draggingCard, setDraggingCard] = useState(null);
  const [pendingDrag, setPendingDrag] = useState(null); // kliknięcie oczekujące
  const [draggingPos, setDraggingPos] = useState({ x: 0, y: 0 });
  const [sidebarFreights, setSidebarFreights] = useState([
    { id: 1, name: "Fracht A", type: "Electronics", weight: "120kg", status: "Pending" },
    { id: 2, name: "Fracht B", type: "Furniture", weight: "450kg", status: "In Transit" },
    { id: 3, name: "Fracht C", type: "Clothing", weight: "200kg", status: "Delivered" },
  ]);

  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const portRefs = useRef({});
  const sidebarDragOffset = useRef({ x: 0, y: 0 });

  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [rects, setRects] = useState([]);
  const [lines, setLines] = useState([]);
  const [drawingLine, setDrawingLine] = useState(null);
  const [draggingRect, setDraggingRect] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Resize canvas
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

  // Global mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (pendingDrag && !draggingCard) {
        const dx = Math.abs(e.clientX - pendingDrag.startX);
        const dy = Math.abs(e.clientY - pendingDrag.startY);
        if (dx > 5 || dy > 5) {
          setDraggingCard(pendingDrag.freight);
          sidebarDragOffset.current = { x: pendingDrag.offsetX, y: pendingDrag.offsetY };
          setDraggingPos({
            x: e.clientX - pendingDrag.offsetX,
            y: e.clientY - pendingDrag.offsetY,
          });
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
        if (pos && Math.hypot(x - pos.x, y - pos.y) < 10) return { type, rectId: r.id };
      }
    }
    return null;
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dotSpacing = 40;
    ctx.fillStyle = "#cccccc";
    for (let x = panOffset.x % dotSpacing; x < canvas.width; x += dotSpacing) {
      for (let y = panOffset.y % dotSpacing; y < canvas.height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const drawWavyLine = (from, to, color = "#555") => {
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
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    lines.forEach(({ fromId, toId }) => {
      const from = getPortPosition(fromId, "output");
      const to = getPortPosition(toId, "input");
      if (from && to) drawWavyLine(from, to);
    });

    if (drawingLine) {
      const from = getPortPosition(drawingLine.fromId, "output");
      const to = drawingLine.toId
        ? getPortPosition(drawingLine.toId, "input")
        : { x: drawingLine.toX, y: drawingLine.toY };
      if (from && to) drawWavyLine(from, to, "#999");
    }
  }, [rects, lines, drawingLine, panOffset, canvasSize]);

  // Sidebar mouse down
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

  // Sidebar mouse up – klik bez drag → anuluj
  const handleMouseUpSidebar = () => {
    setPendingDrag(null);
  };

  // Canvas mouse events
  const handleMouseDownCanvas = (e) => {
    if (!canvasWrapperRef.current) return;
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const port = findPort(x, y);
    if (port?.type === "output") return setDrawingLine({ fromId: port.rectId, toX: x, toY: y });

    const clicked = rects.find(
      (r) =>
        x >= r.x + panOffset.x &&
        x <= r.x + panOffset.x + 240 &&
        y >= r.y + panOffset.y &&
        y <= r.y + panOffset.y + 170
    );
    if (clicked) {
      setDraggingRect(clicked.id);
      setDragOffset({ x: x - (clicked.x + panOffset.x), y: y - (clicked.y + panOffset.y) });
      return;
    }

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
    if (draggingCard && canvasWrapperRef.current) {
      const wrapper = canvasWrapperRef.current.getBoundingClientRect();
      const x = e.clientX - wrapper.left - panOffset.x - sidebarDragOffset.current.x;
      const y = e.clientY - wrapper.top - panOffset.y - sidebarDragOffset.current.y;

      setRects((prev) => [...prev, { id: Date.now(), x, y, freight: draggingCard }]);
      setSidebarFreights((prev) => prev.filter((f) => f.id !== draggingCard.id));
    }

    setDraggingCard(null);
    setPendingDrag(null);
    setDraggingRect(null);
    setDrawingLine(null);
    setIsPanning(false);
  };

  return (
    <div className="flex w-screen h-screen">
      {/* Sidebar */}
      <div className="z-20 box-content flex-shrink-0 bg-gray-50 p-4 border-r w-[240px] overflow-y-auto">
        {sidebarFreights.map((f) => (
          <div
            key={f.id}
            onMouseDown={(e) => handleMouseDownSidebar(e, f)}
            onMouseUp={handleMouseUpSidebar}
          >
            <Card className="hover:shadow-lg mb-2 h-[170px] transition-all duration-300 cursor-grab select-none">
              <div className="relative w-full h-full">
                <div className="top-1/2 -left-2 absolute bg-white border border-gray-500 rounded-full w-4 h-4 -translate-y-1/2" />
                <div className="top-1/2 -right-2 absolute bg-white border border-gray-500 rounded-full w-4 h-4 -translate-y-1/2" />
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">{f.name}</CardTitle>
                  <CardDescription className="text-xs">{f.type}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center p-2">
                  <span className="text-sm">{f.weight}</span>
                  <Badge
                    variant={
                      f.status === "Delivered"
                        ? "success"
                        : f.status === "In Transit"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {f.status}
                  </Badge>
                </CardContent>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasWrapperRef}
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab"
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
        {rects.map((r) => {
          if (!portRefs.current[r.id])
            portRefs.current[r.id] = { input: React.createRef(), output: React.createRef() };
          const x = r.x + panOffset.x;
          const y = r.y + panOffset.y;
          return (
            <div
              key={r.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 240,
                height: 170,
                zIndex: 10,
              }}
            >
              <Card className="relative hover:shadow-lg w-full h-full select-none">
                <div
                  ref={portRefs.current[r.id].input}
                  className="top-1/2 -left-2 absolute bg-white border rounded-full w-4 h-4 -translate-y-1/2 cursor-pointer"
                />
                <div
                  ref={portRefs.current[r.id].output}
                  className="top-1/2 -right-2 absolute bg-white border rounded-full w-4 h-4 -translate-y-1/2 cursor-pointer"
                />
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">{r.freight.name}</CardTitle>
                  <CardDescription className="text-xs">{r.freight.type}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center p-2">
                  <span className="text-sm">{r.freight.weight}</span>
                  <Badge
                    variant={
                      r.freight.status === "Delivered"
                        ? "success"
                        : r.freight.status === "In Transit"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {r.freight.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Dragging Card */}
        {draggingCard && (
          <div
            style={{
              position: "fixed",
              left: draggingPos.x,
              top: draggingPos.y,
              width: 240,
              height: 170,
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            <Card className="relative hover:shadow-lg w-full h-full select-none">
              <div className="top-1/2 -left-2 absolute bg-white border rounded-full w-4 h-4 -translate-y-1/2" />
              <div className="top-1/2 -right-2 absolute bg-white border rounded-full w-4 h-4 -translate-y-1/2" />
              <CardHeader className="p-2">
                <CardTitle className="text-sm">{draggingCard.name}</CardTitle>
                <CardDescription className="text-xs">{draggingCard.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center p-2">
                <span className="text-sm">{draggingCard.weight}</span>
                <Badge
                  variant={
                    draggingCard.status === "Delivered"
                      ? "success"
                      : draggingCard.status === "In Transit"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {draggingCard.status}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
