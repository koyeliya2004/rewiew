import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type MouseState = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  down: boolean;
  worldX: number;
  worldY: number;
};

export const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<MouseState>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    down: false,
    worldX: 0,
    worldY: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS INITIALIZATION ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.z = 900;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);

    // --- PARTICLE SYSTEM CONSTANTS ---
    const particleCount = 28000;
    const penParticleCount = 1000;

    // --- BOOK SYSTEM ---
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const baseColors = new Float32Array(particleCount * 3);

    const tempColor = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Initial Random State
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

      // Define Book Geometry Targets
      const pageSide = i < particleCount / 2 ? -1 : 1;
      const pU = Math.random();
      const pV = (Math.random() - 0.5) * 2;
      const pW = 480;
      const pH = 580;

      targetPositions[i * 3] = pW * pU * pageSide;
      targetPositions[i * 3 + 1] = (pH / 2) * pV;
      targetPositions[i * 3 + 2] =
        Math.sin(pU * Math.PI) * 85 + (Math.random() - 0.5) * 12;

      // Colorful Palette
      const hueBase = pageSide === -1 ? 0.55 : 0.85;
      const hue = hueBase + pU * 0.15;
      tempColor.setHSL(hue % 1, 0.75, 0.45);
      baseColors[i * 3] = tempColor.r;
      baseColors[i * 3 + 1] = tempColor.g;
      baseColors[i * 3 + 2] = tempColor.b;

      // Initial color match
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // --- PEN CURSOR SYSTEM ---
    const penGeometry = new THREE.BufferGeometry();
    const penPositions = new Float32Array(penParticleCount * 3);
    const penColors = new Float32Array(penParticleCount * 3);

    for (let i = 0; i < penParticleCount; i++) {
      const ratio = i / penParticleCount;
      const angle = Math.random() * Math.PI * 2;
      const radius =
        ratio < 0.08 ? ratio * 14 : (1.1 - ratio) * 4.5 + 0.6;
      const length = ratio * 220;

      penPositions[i * 3] = Math.cos(angle) * radius;
      penPositions[i * 3 + 1] = length;
      penPositions[i * 3 + 2] = Math.sin(angle) * radius;

      const pC = new THREE.Color();
      if (ratio < 0.05) pC.setHex(0xa67c00); // Gold nib
      else if (ratio < 0.25) pC.setHex(0x333333); // Grip
      else pC.setHex(0x111111); // Body

      penColors[i * 3] = pC.r;
      penColors[i * 3 + 1] = pC.g;
      penColors[i * 3 + 2] = pC.b;
    }

    penGeometry.setAttribute("position", new THREE.BufferAttribute(penPositions, 3));
    penGeometry.setAttribute("color", new THREE.BufferAttribute(penColors, 3));

    const penSystem = new THREE.Points(
      penGeometry,
      new THREE.PointsMaterial({
        size: 1.6,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      })
    );
    scene.add(penSystem);

    // --- EVENT LISTENERS ---
    const handleMouseMove = (event: { clientX: number; clientY: number }) => {
      mouseRef.current.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.worldX = mouseRef.current.targetX * 620;
      mouseRef.current.worldY = mouseRef.current.targetY * 420;
    };

    const handleMouseDown = () => {
      mouseRef.current.down = true;
    };
    const handleMouseUp = () => {
      mouseRef.current.down = false;
    };
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const onTouchStart = (e: TouchEvent) => {
      mouseRef.current.down = true;
      if (e.touches[0]) handleMouseMove(e.touches[0]);
    };
    const onTouchEnd = () => {
      mouseRef.current.down = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMouseMove(e.touches[0]);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // --- ANIMATION LOOP ---
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      const posAttr = particleSystem.geometry.attributes.position
        .array as Float32Array;
      const colAttr = particleSystem.geometry.attributes.color
        .array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const step = 0.05;
        const i3 = i * 3;

        // Position interpolation
        posAttr[i3] += (targetPositions[i3] - posAttr[i3]) * step;
        posAttr[i3 + 1] += (targetPositions[i3 + 1] - posAttr[i3 + 1]) * step;
        posAttr[i3 + 2] += (targetPositions[i3 + 2] - posAttr[i3 + 2]) * step;

        // Interaction
        const dx = posAttr[i3] - penSystem.position.x;
        const dy = posAttr[i3 + 1] - penSystem.position.y;
        const dz = posAttr[i3 + 2] - (penSystem.position.z - 20);
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 14000) {
          const force = (14000 - distSq) / 14000;
          const mag = mouse.down ? -0.32 : 0.07;
          posAttr[i3] += dx * force * mag;
          posAttr[i3 + 1] += dy * force * mag;
        }

        // Color interpolation
        colAttr[i3] += (baseColors[i3] - colAttr[i3]) * 0.04;
        colAttr[i3 + 1] += (baseColors[i3 + 1] - colAttr[i3 + 1]) * 0.04;
        colAttr[i3 + 2] += (baseColors[i3 + 2] - colAttr[i3 + 2]) * 0.04;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.color.needsUpdate = true;

      // Pen Logic
      const penZ = mouse.down ? 18 : 100;
      penSystem.position.x += (mouse.worldX - penSystem.position.x) * 0.25;
      penSystem.position.y += (mouse.worldY - penSystem.position.y) * 0.25;
      penSystem.position.z += (penZ - penSystem.position.z) * 0.18;

      penSystem.rotation.z = -0.4 + mouse.x * 0.35;
      penSystem.rotation.x = 0.5 - mouse.y * 0.25;

      particleSystem.rotation.y = mouse.x * 0.1;
      particleSystem.rotation.x = -(mouse.y * 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", onTouchMove);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      penGeometry.dispose();
      (penSystem.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Paper fold indicator */}
      <div className="fixed left-1/2 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-black/[0.04] to-transparent" />
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
