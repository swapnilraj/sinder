"use client";

import { useState, useRef } from "react";
import { Sin } from "../lib/contracts";

interface SinCardProps {
  sin: Sin;
  onSwipe: (sinId: number, direction: 'left' | 'right') => void;
  zIndex: number;
  disabled?: boolean;
  isAbsolved?: boolean;
}

export default function SinCard({ sin, onSwipe, zIndex, disabled = false, isAbsolved = false }: SinCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number, clientY: number) => {
    if (disabled) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || disabled) return;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    
    const threshold = 100;
    const direction = dragOffset.x > threshold ? 'right' : dragOffset.x < -threshold ? 'left' : null;
    
    if (direction) {
      onSwipe(sin.id, direction);
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = Math.max(0.3, 1 - Math.abs(dragOffset.x) / 200);

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 rounded-lg shadow-lg ${
        isAbsolved 
          ? 'bg-green-50 border-2 border-green-200 cursor-not-allowed opacity-75' 
          : disabled 
            ? 'bg-white cursor-not-allowed opacity-50' 
            : 'bg-white cursor-grab active:cursor-grabbing'
      }`}
      style={{
        zIndex,
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity: disabled ? 0.5 : opacity,
        transition: isDragging ? 'none' : 'all 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="p-6 h-full flex flex-col justify-between">
        <div>
          <div className="text-sm text-gray-400 mb-2">Sin #{sin.id}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{sin.name}</h3>
          <p className="text-gray-700 mb-4">{sin.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {sin.priceEth} ETH
            </div>
            <div className="text-sm text-gray-500">
              {isAbsolved ? 'Already Absolved ✓' : (sin.active ? 'Active' : 'Inactive')}
            </div>
          </div>
          
          <div className="flex space-x-2 text-sm text-gray-500">
            <span>← skip</span>
            <span>{isAbsolved ? 'already absolved' : 'absolve →'}</span>
          </div>
        </div>
      </div>
      
      {/* Swipe indicators */}
      {Math.abs(dragOffset.x) > 50 && (
        <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${
          dragOffset.x > 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {dragOffset.x > 0 ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
}
