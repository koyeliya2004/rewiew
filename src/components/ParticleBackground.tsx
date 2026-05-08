import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL_PAGES = 7;
const SYMBOLS = ["📖", "☁️", "⚛️", "🔥", "✨", "💥", "🕳️"];

export const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const [currentPage, setCurrentPage] = useState(0);
  const targetsRef = useRef<Float32Array | null>(null);
  const colorsRef = useRef<Float32Array | null>(null);
  const particleCount = 15000;

  const getPageTargets = (pageId: number, count: number) => {
    const targets = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Choose colors based on "light" vs "dark" context. 
    // Since the user asked for "white", we'll use darker/muter colors for the particles.
    const isLightMode = true; 

    for (let i = 0; i < count; i++) {
        let x = 0, y = 0, z = 0;
        let r = 0, g = 0, b = 0;

        switch(pageId) {
            case 0: // Page 0: Open Book
                const pageSide = i < count / 2 ? -1 : 1;
                const pU = Math.random(); 
                const pV = (Math.random() - 0.5) * 2; 
                const pW = 250;
                const pH = 350; 
                x = pW * pU * pageSide;
                y = (pH / 2) * pV;
                z = Math.sin(pU * Math.PI) * 40;
                z += (Math.random() - 0.5) * 10;
                // Parchment color
                r = 0.8; g = 0.6; b = 0.4;
                break;
            case 1: // Page 1: Cloud
                x = (Math.random() - 0.5) * 800;
                y = (Math.random() - 0.5) * 500;
                z = (Math.random() - 0.5) * 500;
                r = 0.4; g = 0.6; b = 0.9;
                break;
            case 2: // Page 2: Core
                const phi = Math.acos(-1 + (2 * i) / count);
                const theta = Math.sqrt(count * Math.PI) * phi;
                const radius = 200 + (Math.random() * 20);
                x = radius * Math.cos(theta) * Math.sin(phi);
                y = radius * Math.sin(theta) * Math.sin(phi);
                z = radius * Math.cos(phi);
                r = 0.6; g = 0.4; b = 0.8;
                break;
            default:
                x = (Math.random() - 0.5) * 600;
                y = (Math.random() - 0.5) * 600;
                z = (Math.random() - 0.5) * 600;
                r = 0.5; g = 0.5; b = 0.5;
        }

        targets[i * 3] = x;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = z;
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
    }
    return { targets, colors };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 700;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialData = getPageTargets(0, particleCount);
    targetsRef.current = initialData.targets;
    colorsRef.current = initialData.colors;

    // Initial random spread
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(initialData.colors), 3));

    // Particle Texture
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.4, // Subtler for white background
      blending: THREE.NormalBlending, // Normal blending works better on white
      sizeAttenuation: true,
      map: texture,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', () => mouseRef.current.down = true);
    window.addEventListener('mouseup', () => mouseRef.current.down = false);
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let frame: number;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const posAttr = geometry.attributes.position;
      const colAttr = geometry.attributes.color;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;
      const targets = targetsRef.current!;
      const colors = colorsRef.current!;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
        const step = 0.05;

        // Transition to targets
        posArr[ix] += (targets[ix] - posArr[ix]) * step;
        posArr[iy] += (targets[iy] - posArr[iy]) * step;
        posArr[iz] += (targets[iz] - posArr[iz]) * step;

        // Color transitions
        colArr[ix] += (colors[ix] - colArr[ix]) * 0.05;
        colArr[iy] += (colors[iy] - colArr[iy]) * 0.05;
        colArr[iz] += (colors[iz] - colArr[iz]) * 0.05;

        // Interactive "Swirl" reaction
        const tx = mouseRef.current.x * 500;
        const ty = mouseRef.current.y * 500;
        const dx = posArr[ix] - tx;
        const dy = posArr[iy] - ty;
        const distSq = dx * dx + dy * dy;

        if (distSq < 20000) {
          const force = (20000 - distSq) / 20000;
          
          // If mouse down, suck them in, otherwise push/swirl them
          if (mouseRef.current.down) {
             posArr[ix] -= dx * force * 0.1;
             posArr[iy] -= dy * force * 0.1;
          } else {
             // Swirl effect
             const angle = 0.1 * force;
             const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
             const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
             posArr[ix] = tx + rx;
             posArr[iy] = ty + ry;
          }
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Rotation and Perspective
      particleSystem.rotation.y = mouseRef.current.x * 0.15;
      particleSystem.rotation.x = -mouseRef.current.y * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frame);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  const goToPage = (idx: number) => {
    if (idx < 0 || idx >= TOTAL_PAGES) return;
    setCurrentPage(idx);
    const { targets, colors } = getPageTargets(idx, particleCount);
    targetsRef.current = targets;
    colorsRef.current = colors;
  };

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      
      {/* Interactive Controls Overlay (needs pointer events to be clickable) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-8">
        <div className="flex justify-center gap-4 pointer-events-auto">
          <button 
            onClick={() => goToPage(currentPage - 1)}
            className="p-2 bg-gray-100 hover:bg-orange-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-orange-600" />
          </button>
          <div className="flex items-center gap-2">
            {SYMBOLS.map((s, i) => (
              <div 
                key={i} 
                onClick={() => goToPage(i)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === currentPage ? 'bg-orange-500 scale-150' : 'bg-gray-200 hover:bg-gray-400'}`}
              />
            ))}
          </div>
          <button 
            onClick={() => goToPage(currentPage + 1)}
            className="p-2 bg-gray-100 hover:bg-orange-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400 hover:text-orange-600" />
          </button>
        </div>
      </div>

      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-2xl opacity-20 pointer-events-none">
        {SYMBOLS[currentPage]}
      </div>
    </div>
  );
};
