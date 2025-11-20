/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowUpTrayIcon, SparklesIcon, CpuChipIcon, PaperAirplaneIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const CyclingText = () => {
    const words = [
        "a napkin sketch",
        "a chaotic whiteboard",
        "a game level design",
        "a sci-fi interface",
        "a diagram of a machine",
        "an ancient scroll"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // fade out
            setTimeout(() => {
                setIndex(prev => (prev + 1) % words.length);
                setFade(true); // fade in
            }, 500); // Wait for fade out
        }, 3000); // Slower cycle to read longer text
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className={`inline-block whitespace-nowrap transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'} text-white font-medium pb-1 border-b-2 border-blue-500/50`}>
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState("");

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      onGenerate(prompt, file);
    } else {
      alert("Please upload an image or PDF.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating, prompt]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleTextSubmit = () => {
      if (!prompt.trim() || isGenerating) return;
      onGenerate(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleTextSubmit();
      }
  };

  const setExamplePrompt = () => {
      setPrompt("Create a Space Tower Defense game. Use 'Python-style' Object Oriented Programming (Classes for Tower, Enemy, Projectile, GameState) but adapted for JavaScript. Features: 1. Neon vector graphics on a dark space background. 2. Enemies follow a defined path (waypoints). 3. Click to place towers (cost money). 4. Particle effects for explosions. 5. Wave system. 6. Playable immediately.");
  };

  return (
    <div className="w-full max-w-4xl mx-auto perspective-1000 flex flex-col gap-4">
      
      {/* Text Input Area */}
      <div className="w-full relative z-20">
          <div className="relative bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-lg">
              <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you want to build (or leave empty and just drop a file)..."
                  className="w-full bg-transparent text-zinc-200 placeholder-zinc-500 text-base p-4 pr-14 h-14 max-h-32 focus:outline-none resize-none scrollbar-hide"
                  disabled={isGenerating || disabled}
              />
              <button
                  onClick={handleTextSubmit}
                  disabled={!prompt.trim() || isGenerating || disabled}
                  className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg transition-all ${prompt.trim() ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-zinc-800 text-zinc-600'}`}
              >
                  {isGenerating ? (
                      <SparklesIcon className="w-5 h-5 animate-spin" />
                  ) : (
                      <PaperAirplaneIcon className="w-5 h-5" />
                  )}
              </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide py-1">
              <button 
                onClick={setExamplePrompt}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-blue-900/20 border border-zinc-700 hover:border-blue-500/30 rounded-full text-xs font-medium text-zinc-400 hover:text-blue-400 transition-all whitespace-nowrap"
              >
                  <RocketLaunchIcon className="w-3.5 h-3.5" />
                  <span>Try: Python Space Defense</span>
              </button>
          </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 opacity-50">
          <div className="h-px bg-zinc-700 flex-1"></div>
          <span className="text-xs font-mono text-zinc-500">OR DROP A FILE</span>
          <div className="h-px bg-zinc-700 flex-1"></div>
      </div>

      {/* Drop Zone */}
      <div 
        className={`relative group transition-all duration-300 ${isDragging ? 'scale-[1.01]' : ''}`}
      >
        <label
          className={`
            relative flex flex-col items-center justify-center
            h-48 sm:h-56 md:h-64
            bg-zinc-900/30 
            backdrop-blur-sm
            rounded-xl border border-dashed
            cursor-pointer overflow-hidden
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-500 bg-zinc-900/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/40'
            }
            ${isGenerating ? 'pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
            {/* Technical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            {/* Corner Brackets for technical feel */}
            <div className={`absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-4 md:space-y-6 p-6 w-full">
                <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
                    <div className={`absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                        {isGenerating ? (
                            <CpuChipIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-400 animate-spin-slow" />
                        ) : (
                            <ArrowUpTrayIcon className={`w-6 h-6 md:w-8 md:h-8 text-zinc-300 transition-all duration-300 ${isDragging ? '-translate-y-1 text-blue-400' : ''}`} />
                        )}
                    </div>
                </div>

                <div className="space-y-2 w-full max-w-3xl">
                    <h3 className="flex flex-col items-center justify-center text-lg sm:text-xl md:text-3xl text-zinc-100 leading-none font-bold tracking-tighter gap-2">
                        <span>Bring</span>
                        {/* Fixed height container to prevent layout shifts */}
                        <div className="h-6 sm:h-8 md:h-10 flex items-center justify-center w-full">
                           <CyclingText />
                        </div>
                        <span>to life</span>
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm font-light tracking-wide">
                        <span className="hidden md:inline">Drag & Drop</span>
                        <span className="md:hidden">Tap</span> to upload any file
                    </p>
                </div>
            </div>

            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
        </label>
      </div>
    </div>
  );
};