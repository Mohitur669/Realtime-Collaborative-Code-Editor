import React, { useState, useRef, useEffect } from 'react';
import { WhiteboardElement } from '@codesync/shared-types';

interface WhiteboardPanelProps {
  elements: WhiteboardElement[];
  onAddElement: (element: WhiteboardElement) => void;
  onClearElements: () => void;
}

export const WhiteboardPanel: React.FC<WhiteboardPanelProps> = ({
  elements,
  onAddElement,
  onClearElements,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 600,
  });
  const [tool, setTool] = useState<'pencil' | 'rectangle' | 'circle' | 'text'>('pencil');
  const [color, setColor] = useState('#22c55e');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const [textModalPos, setTextModalPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputVal, setTextInputVal] = useState('');

  // ResizeObserver to make whiteboard canvas fit container width/height dynamically
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasDimensions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Redraw canvas whenever elements, dimensions or active stroke changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#030712'; // dark gray background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw saved Yjs elements
    elements.forEach((el) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'pencil' && el.points && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'rectangle' && el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
        ctx.beginPath();
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      } else if (el.type === 'circle' && el.x !== undefined && el.y !== undefined && el.width !== undefined) {
        ctx.beginPath();
        ctx.arc(el.x, el.y, Math.abs(el.width) / 2, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === 'text' && el.x !== undefined && el.y !== undefined && el.text) {
        ctx.font = '14px sans-serif';
        ctx.fillText(el.text, el.x, el.y);
      }
    });

    // Draw active drawing in progress
    if (isDrawing) {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'pencil' && currentPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.stroke();
      }
    }
  }, [elements, isDrawing, currentPoints, tool, color, strokeWidth, canvasDimensions]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(pos);
    if (tool === 'pencil') {
      setCurrentPoints([pos]);
    } else if (tool === 'text') {
      setTextModalPos(pos);
      setTextInputVal('');
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCanvasCoords(e);
    if (tool === 'pencil') {
      setCurrentPoints((prev) => [...prev, pos]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const endPos = getCanvasCoords(e);
    setIsDrawing(false);

    if (tool === 'pencil' && currentPoints.length > 1) {
      onAddElement({
        id: `el_${Date.now()}`,
        type: 'pencil',
        points: currentPoints,
        color,
        strokeWidth,
      });
    } else if (startPos && tool === 'rectangle') {
      onAddElement({
        id: `el_${Date.now()}`,
        type: 'rectangle',
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        color,
        strokeWidth,
      });
    } else if (startPos && tool === 'circle') {
      const radius = Math.sqrt(Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
      onAddElement({
        id: `el_${Date.now()}`,
        type: 'circle',
        x: startPos.x,
        y: startPos.y,
        width: radius * 2,
        height: radius * 2,
        color,
        strokeWidth,
      });
    }

    setCurrentPoints([]);
    setStartPos(null);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 relative">
      {/* Tools Toolbar */}
      <div className="p-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 overflow-x-auto min-w-0">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setTool('pencil')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              tool === 'pencil' ? 'bg-green-500 text-gray-950' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="Pencil"
          >
            Pencil
          </button>
          <button
            onClick={() => setTool('rectangle')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              tool === 'rectangle' ? 'bg-green-500 text-gray-950' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="Rectangle"
          >
            Rect
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              tool === 'circle' ? 'bg-green-500 text-gray-950' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="Circle"
          >
            Circle
          </button>
          <button
            onClick={() => setTool('text')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              tool === 'text' ? 'bg-green-500 text-gray-950' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title="Text"
          >
            Text
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#ffffff'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                color === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onClearElements}
            className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold rounded-lg border border-red-500/30"
          >
            Clear
          </button>
          <button
            onClick={handleExportPNG}
            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg border border-gray-700"
          >
            Export
          </button>
        </div>
      </div>

      {/* Interactive Full-Width Canvas Viewport */}
      <div ref={containerRef} className="flex-1 w-full h-full relative bg-gray-950 overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="bg-gray-950 cursor-crosshair w-full h-full"
        />
      </div>

      {/* Text Entry Modal */}
      {textModalPos && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-2xl w-full max-w-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-200">Add Text to Whiteboard</h4>
            <input
              type="text"
              value={textInputVal}
              onChange={(e) => setTextInputVal(e.target.value)}
              placeholder="Enter text..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-indigo-500 font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (textInputVal.trim() && textModalPos) {
                    onAddElement({
                      id: `el_${Date.now()}`,
                      type: 'text',
                      x: textModalPos.x,
                      y: textModalPos.y,
                      text: textInputVal.trim(),
                      color,
                      strokeWidth,
                    });
                  }
                  setTextModalPos(null);
                }
              }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setTextModalPos(null)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg border border-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (textInputVal.trim() && textModalPos) {
                    onAddElement({
                      id: `el_${Date.now()}`,
                      type: 'text',
                      x: textModalPos.x,
                      y: textModalPos.y,
                      text: textInputVal.trim(),
                      color,
                      strokeWidth,
                    });
                  }
                  setTextModalPos(null);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
