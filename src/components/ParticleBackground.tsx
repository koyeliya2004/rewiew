import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let particleSystem: THREE.Points;
    let penSystem: THREE.Points;
    let targetPositions = new Float32Array();
    let colors = new Float32Array();

    const particleCount = 28000;
    const penParticleCount = 1000;

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      down: false,
      worldX: 0,
      worldY: 0,
    };

    const createBookGeometry = () => {
      targetPositions = new Float32Array(particleCount * 3);
      const tempColor = new THREE.Color();

      for (let i = 0; i < particleCount; i++) {
        const pageSide = i < particleCount / 2 ? -1 : 1;
        const pU = Math.random();
        const pV = (Math.random() - 0.5) * 2;

        const pW = 450;
        const pH = 550;

        const bx = pW * pU * pageSide;
        const by = (pH / 2) * pV;
        let bz = Math.sin(pU * Math.PI) * 90;
        bz += (Math.random() - 0.5) * 15;

        targetPositions[i * 3] = bx;
        targetPositions[i * 3 + 1] = by;
        targetPositions[i * 3 + 2] = bz;

        const hue = pageSide === -1 ? 0.55 + pU * 0.15 : 0.85 + pU * 0.15;
        tempColor.setHSL(hue % 1, 0.85, 0.6);

        colors[i * 3] = tempColor.r;
        colors[i * 3 + 1] = tempColor.g;
        colors[i * 3 + 2] = tempColor.b;
      }
    };

    const onMouseMove = (event: MouseEvent | Touch) => {
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
      mouse.worldX = mouse.targetX * 600;
      mouse.worldY = mouse.targetY * 400;
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.z = 950;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
      sizes[i] = Math.random() * 2.0 + 0.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    const penGeometry = new THREE.BufferGeometry();
    const penPositions = new Float32Array(penParticleCount * 3);
    const penColors = new Float32Array(penParticleCount * 3);

    for (let i = 0; i < penParticleCount; i++) {
      const ratio = i / penParticleCount;
      const angle = Math.random() * Math.PI * 2;
      const radius = ratio < 0.08 ? ratio * 12 : (1.1 - ratio) * 4 + 0.5;
      const length = ratio * 200;

      penPositions[i * 3] = Math.cos(angle) * radius;
      penPositions[i * 3 + 1] = length;
      penPositions[i * 3 + 2] = Math.sin(angle) * radius;

      const penColor = new THREE.Color();
      if (ratio < 0.05) penColor.setHex(0xffcc33);
      else if (ratio < 0.2) penColor.setHex(0x444444);
      else penColor.setHex(0x111111);

      penColors[i * 3] = penColor.r;
      penColors[i * 3 + 1] = penColor.g;
      penColors[i * 3 + 2] = penColor.b;
    }

    penGeometry.setAttribute("position", new THREE.BufferAttribute(penPositions, 3));
    penGeometry.setAttribute("color", new THREE.BufferAttribute(penColors, 3));

    penSystem = new THREE.Points(
      penGeometry,
      new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(penSystem);

    createBookGeometry();

    const onMouseDown = () => {
      mouse.down = true;
    };
    const onMouseUp = () => {
      mouse.down = false;
    };
    const onTouchStart = (e: TouchEvent) => {
      mouse.down = true;
      onMouseMove(e.touches[0]);
    };
    const onTouchEnd = () => {
      mouse.down = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      onMouseMove(e.touches[0]);
    };

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchmove", onTouchMove);

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      const posAttr = particleSystem.geometry.attributes.position.array as Float32Array;
      const colAttr = particleSystem.geometry.attributes.color.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const step = 0.05;
        posAttr[i * 3] += (targetPositions[i * 3] - posAttr[i * 3]) * step;
        posAttr[i * 3 + 1] += (targetPositions[i * 3 + 1] - posAttr[i * 3 + 1]) * step;
        posAttr[i * 3 + 2] += (targetPositions[i * 3 + 2] - posAttr[i * 3 + 2]) * step;

        const dx = posAttr[i * 3] - penSystem.position.x;
        const dy = posAttr[i * 3 + 1] - penSystem.position.y;
        const dz = posAttr[i * 3 + 2] - (penSystem.position.z - 20);
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 15000) {
          const force = (15000 - distSq) / 15000;
          const mag = mouse.down ? -0.3 : 0.06;
          posAttr[i * 3] += dx * force * mag;
          posAttr[i * 3 + 1] += dy * force * mag;
        }

        colAttr[i * 3] += (colors[i * 3] - colAttr[i * 3]) * 0.04;
        colAttr[i * 3 + 1] += (colors[i * 3 + 1] - colAttr[i * 3 + 1]) * 0.04;
        colAttr[i * 3 + 2] += (colors[i * 3 + 2] - colAttr[i * 3 + 2]) * 0.04;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.color.needsUpdate = true;

      const penZ = mouse.down ? 20 : 110;
      penSystem.position.x += (mouse.worldX - penSystem.position.x) * 0.3;
      penSystem.position.y += (mouse.worldY - penSystem.position.y) * 0.3;
      penSystem.position.z += (penZ - penSystem.position.z) * 0.15;

      penSystem.rotation.z = -0.4 + mouse.x * 0.4;
      penSystem.rotation.x = 0.5 - mouse.y * 0.3;

      particleSystem.rotation.y = mouse.x * 0.1;
      particleSystem.rotation.x = -(mouse.y * 0.05);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", onTouchMove);
      geometry.dispose();
      material.dispose();
      penGeometry.dispose();
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-[#050505]">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute left-1/2 top-[5%] bottom-[5%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0" />
    </div>
  );
};
