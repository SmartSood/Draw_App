import { Point, Element, PreRenderedShape } from '../types/drawing';
import { Star, Heart, Triangle, Hexagon, Diamond } from 'lucide-react';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const drawRoughLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number
) => {
  const roughness = strokeWidth * 0.5;
  const segments = Math.max(Math.floor(distance({ x: x1, y: y1 }, { x: x2, y: y2 }) / 10), 2);
  
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * roughness;
    const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * roughness;
    ctx.lineTo(x, y);
  }
  
  ctx.stroke();
};

export const drawRoughRectangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const roughness = strokeWidth * 0.5;
  
  // Top line
  drawRoughLine(ctx, x, y, x + width, y, strokeWidth);
  // Right line
  drawRoughLine(ctx, x + width, y, x + width, y + height, strokeWidth);
  // Bottom line
  drawRoughLine(ctx, x + width, y + height, x, y + height, strokeWidth);
  // Left line
  drawRoughLine(ctx, x, y + height, x, y, strokeWidth);
};

export const drawRoughEllipse = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const roughness = strokeWidth * 0.5;
  const segments = 32;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;
  
  ctx.beginPath();
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const px = centerX + radiusX * Math.cos(angle) + (Math.random() - 0.5) * roughness;
    const py = centerY + radiusY * Math.sin(angle) + (Math.random() - 0.5) * roughness;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.stroke();
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number
) => {
  // Draw the line
  drawRoughLine(ctx, x1, y1, x2, y2, strokeWidth);
  
  // Calculate arrow head
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = strokeWidth * 5;
  
  // Arrow head lines
  const leftX = x2 - headLength * Math.cos(angle - Math.PI / 6);
  const leftY = y2 - headLength * Math.sin(angle - Math.PI / 6);
  const rightX = x2 - headLength * Math.cos(angle + Math.PI / 6);
  const rightY = y2 - headLength * Math.sin(angle + Math.PI / 6);
  
  drawRoughLine(ctx, x2, y2, leftX, leftY, strokeWidth);
  drawRoughLine(ctx, x2, y2, rightX, rightY, strokeWidth);
};

export const drawRoughStar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.4;
  const spikes = 5;
  const roughness = strokeWidth * 0.5;
  
  ctx.beginPath();
  
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const px = centerX + radius * Math.cos(angle - Math.PI / 2) + (Math.random() - 0.5) * roughness;
    const py = centerY + radius * Math.sin(angle - Math.PI / 2) + (Math.random() - 0.5) * roughness;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
};

export const drawRoughHeart = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const size = Math.min(width, height);
  const roughness = strokeWidth * 0.5;
  
  ctx.beginPath();
  
  // Heart shape using bezier curves with roughness
  const points = [];
  for (let t = 0; t <= 1; t += 0.05) {
    const heartX = 16 * Math.pow(Math.sin(t * 2 * Math.PI), 3);
    const heartY = -(13 * Math.cos(t * 2 * Math.PI) - 5 * Math.cos(2 * t * 2 * Math.PI) - 2 * Math.cos(3 * t * 2 * Math.PI) - Math.cos(4 * t * 2 * Math.PI));
    
    const px = centerX + (heartX * size / 32) + (Math.random() - 0.5) * roughness;
    const py = centerY + (heartY * size / 32) + (Math.random() - 0.5) * roughness;
    //@ts-expect-error othing will happen
    points.push({ x: px, y: py });
  }
      //@ts-expect-error othing will happen
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
        //@ts-expect-error othing will happen
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
};

export const drawRoughTriangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const centerX = x + width / 2;
  const topY = y;
  const bottomY = y + height;
  const leftX = x;
  const rightX = x + width;
  
  drawRoughLine(ctx, centerX, topY, leftX, bottomY, strokeWidth);
  drawRoughLine(ctx, leftX, bottomY, rightX, bottomY, strokeWidth);
  drawRoughLine(ctx, rightX, bottomY, centerX, topY, strokeWidth);
};

export const drawRoughHexagon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.min(width, height) / 2;
  const roughness = strokeWidth * 0.5;
  
  ctx.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * roughness;
    const py = centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * roughness;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
};

export const drawRoughDiamond = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  drawRoughLine(ctx, centerX, y, x + width, centerY, strokeWidth);
  drawRoughLine(ctx, x + width, centerY, centerX, y + height, strokeWidth);
  drawRoughLine(ctx, centerX, y + height, x, centerY, strokeWidth);
  drawRoughLine(ctx, x, centerY, centerX, y, strokeWidth);
};

export const preRenderedShapes: PreRenderedShape[] = [
  {
    id: 'star',
    name: 'Star',
    icon: Star,
    create: (point: Point, color: string, strokeWidth: number) => ({
      id: generateId(),
      type: 'shape' as const,
      points: [point],
      color,
      strokeWidth,
      x: point.x,
      y: point.y,
      width: 60,
      height: 60,
      customShape: 'star'
    })
  },
  {
    id: 'heart',
    name: 'Heart',
    icon: Heart,
    create: (point: Point, color: string, strokeWidth: number) => ({
      id: generateId(),
      type: 'shape' as const,
      points: [point],
      color,
      strokeWidth,
      x: point.x,
      y: point.y,
      width: 60,
      height: 60,
      customShape: 'heart'
    })
  },
  {
    id: 'triangle',
    name: 'Triangle',
    icon: Triangle,
    create: (point: Point, color: string, strokeWidth: number) => ({
      id: generateId(),
      type: 'shape' as const,
      points: [point],
      color,
      strokeWidth,
      x: point.x,
      y: point.y,
      width: 60,
      height: 60,
      customShape: 'triangle'
    })
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    icon: Hexagon,
    create: (point: Point, color: string, strokeWidth: number) => ({
      id: generateId(),
      type: 'shape' as const,
      points: [point],
      color,
      strokeWidth,
      x: point.x,
      y: point.y,
      width: 60,
      height: 60,
      customShape: 'hexagon'
    })
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: Diamond,
    create: (point: Point, color: string, strokeWidth: number) => ({
      id: generateId(),
      type: 'shape' as const,
      points: [point],
      color,
      strokeWidth,
      x: point.x,
      y: point.y,
      width: 60,
      height: 60,
      customShape: 'diamond'
    })
  }
];

export const isPointInElement = (point: Point, element: Element): boolean => {
  if (element.type === 'pen') {
    return element.points.some(p => distance(point, p) < 10);
  }
  
  if (element.type === 'text') {
    const fontSize = element.fontSize || 16;
    const textWidth = (element.text || '').length * fontSize * 0.6; // Approximate text width
    return point.x >= (element.x || 0) && 
           point.x <= (element.x || 0) + textWidth &&
           point.y >= (element.y || 0) - fontSize && 
           point.y <= (element.y || 0);
  }
  
  if (element.x !== undefined && element.y !== undefined && 
      element.width !== undefined && element.height !== undefined) {
    return point.x >= element.x && point.x <= element.x + element.width &&
           point.y >= element.y && point.y <= element.y + element.height;
  }
  
  return false;
};

export const getBoundingBox = (element: Element): { x: number, y: number, width: number, height: number } => {
  if (element.type === 'pen') {
    const xs = element.points.map(p => p.x);
    const ys = element.points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  
  if (element.type === 'text') {
    const fontSize = element.fontSize || 16;
    const textWidth = (element.text || '').length * fontSize * 0.6;
    return {
      x: element.x || 0,
      y: (element.y || 0) - fontSize,
      width: textWidth,
      height: fontSize
    };
  }
  
  return {
    x: element.x || 0,
    y: element.y || 0,
    width: element.width || 0,
    height: element.height || 0
  };
};