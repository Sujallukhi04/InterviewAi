"use client";

import { useCallback } from "react";
import { ParticlesProvider } from "@tsparticles/react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

import type { Engine } from "@tsparticles/engine";

export default function ParticleBackground() {
  const init = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <ParticlesProvider init={init}>
      <Particles
        id="tsparticles"
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            number: { value: 50, density: { enable: true } },
            color: { value: "#00FF87" },
            opacity: { value: 0.12, random: true },
            size: { value: { min: 1, max: 2 } },
            move: {
              enable: true,
              speed: 0.3,
              direction: "none",
              random: true,
              outModes: { default: "out" }
            },
            links: {
              enable: true,
              color: "#00FF87",
              opacity: 0.04,
              distance: 150,
              width: 1
            }
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" }
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 }
            }
          },
          detectRetina: true
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0
        }}
      />
    </ParticlesProvider>
  );
}
