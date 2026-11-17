import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const VERTEX_SHADER_SRC = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  mat2 rot(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Smooth value noise for organic liquid-silk folds
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Continuous multi-layer folded silk & liquid-glass heightfield
  // Returns vec4(height, foldPhase, cavityOcclusion, layerId)
  vec4 fluidManifold(vec2 uv, float t, vec2 parallax) {
    // Diagonal sweep from bottom-left toward top-right, continuing infinitely off-screen
    vec2 p = uv + parallax * 0.06;
    p = rot(-0.44) * p;
    p.x *= 0.72;
    p.y *= 1.18;

    // Slow organic flow drift
    vec2 flow = vec2(t * 0.14, -t * 0.09);

    // Broad sweeping S-curve domain warp
    vec2 q = p * 1.15;
    q += vec2(
      sin(p.y * 1.6 + p.x * 0.7 + flow.x),
      cos(p.x * 1.4 - p.y * 0.8 + flow.y)
    ) * 0.42;

    // Iterative silk-fold accumulation creating overlapping ribbons & curved valleys
    float h1 = 0.0;
    float amp = 0.56;
    vec2 w = q;
    float foldAccum = 0.0;

    for (int i = 0; i < 4; i++) {
      w = rot(0.36 + float(i) * 0.14) * w;
      vec2 waveShift = vec2(
        sin(w.y * 1.9 + flow.x * (1.0 + float(i) * 0.25)),
        cos(w.x * 1.75 - flow.y * (1.0 + float(i) * 0.2))
      );
      w += waveShift * (0.34 / (1.0 + float(i) * 0.35));

      // Sharp glossy ridge crests + smooth wide valleys
      float ridge = 1.0 - abs(sin(w.y * 1.65 + w.x * 0.55));
      ridge = pow(clamp(ridge, 0.0, 1.0), 1.55);

      float swell = 0.5 + 0.5 * cos(w.x * 1.1 - w.y * 0.85 + t * 0.12);
      float layer = mix(swell, ridge, 0.68);

      h1 += layer * amp;
      foldAccum += (waveShift.x - waveShift.y) * amp;
      w *= 1.48;
      amp *= 0.52;
    }

    // Second overlapping fluid membrane layer at deeper parallax speed
    vec2 p2 = (uv + parallax * 0.03) * rot(-0.32);
    p2.y += 0.22;
    vec2 w2 = p2 * 1.35 + vec2(sin(p2.y * 2.1 - flow.y), cos(p2.x * 1.8 + flow.x)) * 0.38;
    float membrane2 = pow(1.0 - abs(sin(w2.y * 1.9 + w2.x * 0.65)), 1.75) * 0.82;

    // Blend overlapping membranes so one wave folds cleanly over the other
    float overlapMask = smoothstep(0.36, 0.72, h1 - membrane2 * 0.35);
    float combinedH = mix(membrane2 * 0.85, h1, overlapMask);

    // Deep recessed cavities between overlapping folds
    float crease = abs(h1 - membrane2 * 0.85);
    float cavity = smoothstep(0.0, 0.24, crease) * smoothstep(0.18, 0.68, combinedH);

    // Diagonal horizon sculpting: opens upper-left into deep midnight cavity for crisp typography
    float diagHeight = uv.x * 0.42 - uv.y * 0.58;
    float upperLeftOpen = smoothstep(-0.52, 0.46, diagHeight + 0.22 * sin(uv.x * 2.1 + t * 0.1));
    // Lower-right ambient dark pocket matching reference composition
    float lowerRightPocket = 1.0 - 0.55 * smoothstep(0.15, 0.95, uv.x) * smoothstep(-0.05, -0.95, uv.y);

    float envelope = mix(0.28, 1.0, upperLeftOpen) * lowerRightPocket;
    float finalH = combinedH * envelope;

    return vec4(finalH, foldAccum, cavity * envelope, overlapMask);
  }

  // Subtle embedded luminous micro-particles in recessed valleys and illuminated flanks
  float dustField(vec2 uv, float scale, float t, vec2 parallax) {
    vec2 p = uv * scale + parallax * (scale * 0.012) + vec2(t * 0.03, -t * 0.02);
    vec2 id = floor(p);
    vec2 f = fract(p) - 0.5;
    float rnd = hash21(id);
    if (rnd < 0.91) return 0.0;

    vec2 offset = vec2(hash21(id + 13.7), hash21(id + 71.3)) - 0.5;
    float d = length(f - offset * 0.65);
    float size = mix(0.02, 0.075, fract(rnd * 37.0));
    float sparkle = smoothstep(size, 0.0, d);
    float twinkle = 0.55 + 0.45 * sin(t * 1.4 + rnd * 40.0);
    return sparkle * twinkle;
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 uv = (vUv - 0.5) * 2.0 * aspect;
    float t = uTime;

    // Smooth finite-difference 3D surface normal
    vec2 eps = vec2(0.0085, 0.0);
    vec4 center = fluidManifold(uv, t, uMouse);
    float hC = center.x;
    float hR = fluidManifold(uv + eps.xy, t, uMouse).x;
    float hL = fluidManifold(uv - eps.xy, t, uMouse).x;
    float hU = fluidManifold(uv + eps.yx, t, uMouse).x;
    float hD = fluidManifold(uv - eps.yx, t, uMouse).x;

    vec3 N = normalize(vec3((hL - hR) * 2.8, (hD - hU) * 2.8, 0.36));
    vec3 V = normalize(vec3(-uv.x * 0.18 + uMouse.x * 0.14, -uv.y * 0.18 + uMouse.y * 0.14, 1.0));
    vec3 R = reflect(-V, N);

    // Core reference color palette
    vec3 midnight = vec3(0.031, 0.035, 0.063); // #080910
    vec3 deepViolet = vec3(0.196, 0.071, 0.435); // #32126F
    vec3 electricPurple = vec3(0.439, 0.173, 1.000); // #702CFF
    vec3 magenta = vec3(0.890, 0.267, 0.773); // #E344C5
    vec3 cyan = vec3(0.329, 0.851, 1.000); // #54D9FF
    vec3 steelBlue = vec3(0.240, 0.410, 0.680); // Subtle steel blue
    vec3 warmOrange = vec3(1.000, 0.506, 0.365); // #FF815D
    vec3 warmGold = vec3(1.000, 0.820, 0.600); // Crisp specular crest accent

    // Fresnel & iridescent thin-film phase across curved silk folds
    float ndotv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - ndotv, 2.5);
    float ridgeMask = smoothstep(0.22, 0.82, hC);
    float cavity = center.z;
    float foldPhase = center.y;

    // Base translucent liquid-glass absorption
    vec3 baseCol = mix(midnight, deepViolet, smoothstep(0.08, 0.55, hC) * 0.85);
    baseCol = mix(baseCol, steelBlue * 0.72, smoothstep(0.35, 0.75, R.y * 0.5 + 0.5) * ridgeMask * 0.65);

    // Sweeping iridescent silk reflections (cool cyan/steel in center, magenta on left flanks)
    float flankZone = smoothstep(0.35, -0.95, uv.x + uv.y * 0.3);
    float centerSweep = exp(-pow((uv.x * 0.6 - uv.y * 0.2), 2.0) * 1.4);
    float upperRightZone = smoothstep(0.05, 1.15, uv.x + uv.y * 0.55);

    vec3 iridCool = mix(electricPurple, cyan, smoothstep(-0.35, 0.55, R.x + foldPhase * 0.4));
    vec3 iridWarm = mix(electricPurple, magenta, smoothstep(-0.2, 0.65, sin(foldPhase * 2.4 + R.y * 2.0)));

    vec3 silkSheen = mix(iridCool, iridWarm, clamp(flankZone * 0.78 + 0.22 * (1.0 - centerSweep), 0.0, 1.0));
    silkSheen = mix(silkSheen, steelBlue * 1.15, centerSweep * 0.35);

    // Apply iridescent sheen to curved membranes and grazing Fresnel edges
    vec3 color = mix(baseCol, silkSheen, clamp(fresnel * 0.85 + ridgeMask * 0.38, 0.0, 0.92));

    // Directional studio key lighting for glossy metallic-glass ridges
    vec3 keyLight1 = normalize(vec3(-0.35 + uMouse.x * 0.25, 0.78 + uMouse.y * 0.2, 0.52));
    vec3 keyLight2 = normalize(vec3(0.76, 0.42, 0.48));
    vec3 half1 = normalize(keyLight1 + V);
    vec3 half2 = normalize(keyLight2 + V);

    float spec1 = pow(max(dot(N, half1), 0.0), 34.0);
    float spec2 = pow(max(dot(N, half2), 0.0), 56.0);
    float broadSheen1 = pow(max(dot(N, half1), 0.0), 5.0);

    // Cool cyan / steel-blue specular ribbons across center & folds
    color += mix(cyan, vec3(0.92, 0.96, 1.0), 0.45) * spec1 * 0.95 * ridgeMask;
    color += electricPurple * broadSheen1 * 0.28 * ridgeMask;

    // Warm orange & magenta highlights along upper-right crest & sweeping curves
    float warmMask = clamp(upperRightZone * 0.9 + flankZone * 0.35 * smoothstep(0.45, 0.85, hC), 0.0, 1.0);
    color += mix(magenta, warmOrange, 0.68) * pow(max(dot(N, half2), 0.0), 10.0) * warmMask * 0.85;
    color += mix(warmOrange, warmGold, 0.5) * spec2 * (0.45 + 0.95 * upperRightZone) * ridgeMask;

    // Sharp rim highlight along folded ridges
    float rim = smoothstep(0.42, 0.92, fresnel) * smoothstep(0.18, 0.62, hC);
    color += mix(cyan, magenta, flankZone) * rim * 0.42;

    // Deepen tucked-under cavities and dark background sky cleanly into #080910
    float skyDark = smoothstep(0.12, 0.42, hC);
    color = mix(midnight, color, clamp(cavity * 1.15, 0.0, 1.0) * skyDark);

    // Subtle luminous particles embedded inside dark lower valleys & warm flanks
    float dustA = dustField(uv, 18.0, t, uMouse);
    float dustB = dustField(uv + vec2(3.7, 1.9), 34.0, t * 1.2, uMouse * 1.3);
    float valleyMask = smoothstep(-0.85, 0.25, -uv.y) * smoothstep(-0.4, 0.9, uv.x + 0.3);
    float leftWarmMask = flankZone * smoothstep(-0.8, 0.2, uv.y);

    vec3 dustColorA = mix(warmOrange, warmGold, 0.35);
    vec3 dustColorB = mix(cyan, magenta, 0.45);
    color += dustColorA * dustA * (0.45 * valleyMask + 0.35 * leftWarmMask);
    color += dustColorB * dustB * 0.25 * (valleyMask + ridgeMask * 0.4);

    // Smooth filmic tone compression keeping midnight blacks rich and highlights glossy
    color = max(color, midnight);
    color = color / (color + vec3(0.68));
    color = pow(color, vec3(0.94));
    color = mix(midnight, color, 0.96);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function FluidFallbackBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[#080910]"
      style={{
        background: `
          radial-gradient(ellipse 68% 46% at 88% 24%, rgba(255, 129, 93, 0.34) 0%, rgba(227, 68, 197, 0.22) 34%, transparent 70%),
          radial-gradient(ellipse 75% 58% at 52% 58%, rgba(84, 217, 255, 0.24) 0%, rgba(112, 44, 255, 0.36) 38%, rgba(50, 18, 111, 0.42) 64%, #080910 92%),
          radial-gradient(ellipse 62% 52% at 14% 72%, rgba(227, 68, 197, 0.42) 0%, rgba(255, 129, 93, 0.22) 28%, rgba(50, 18, 111, 0.32) 56%, transparent 82%),
          #080910
        `,
      }}
    />
  );
}

export default function FluidEnvironment() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [webglReady, setWebglReady] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const pointerRef = useRef({ targetX: 0, targetY: 0, x: 0, y: 0 });
  const isVisibleRef = useRef(true);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 45, damping: 22, mass: 1 });
  const smoothY = useSpring(rawY, { stiffness: 45, damping: 22, mass: 1 });

  const sheenX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const sheenY = useTransform(smoothY, [-1, 1], [-14, 14]);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;

    const handlePointerMove = (event) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -((event.clientY / window.innerHeight) * 2 - 1);
      const cx = Math.max(-1, Math.min(1, nx));
      const cy = Math.max(-1, Math.min(1, ny));
      rawX.set(cx);
      rawY.set(cy);
      pointerRef.current.targetX = cx;
      pointerRef.current.targetY = cy;
    };

    const handleMouseLeave = () => {
      rawX.set(0);
      rawY.set(0);
      pointerRef.current.targetX = 0;
      pointerRef.current.targetY = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [rawX, rawY, shouldReduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      }) ||
      canvas.getContext("experimental-webgl", {
        alpha: false,
        antialias: true,
      });

    if (!gl) {
      setWebglReady(false);
      return undefined;
    }

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vert || !frag) {
      setWebglReady(false);
      return undefined;
    }

    const program = gl.createProgram();
    if (!program) {
      setWebglReady(false);
      return undefined;
    }

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglReady(false);
      return undefined;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uResLoc = gl.getUniformLocation(program, "uResolution");
    const uMouseLoc = gl.getUniformLocation(program, "uMouse");

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    let rafId = 0;
    const startTime = performance.now();

    const drawFrame = (elapsedSec) => {
      gl.uniform1f(uTimeLoc, elapsedSec);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform2f(uMouseLoc, pointerRef.current.x, pointerRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    if (shouldReduceMotion) {
      drawFrame(2.4);
    } else {
      const loop = (now) => {
        if (isVisibleRef.current) {
          pointerRef.current.x +=
            (pointerRef.current.targetX - pointerRef.current.x) * 0.045;
          pointerRef.current.y +=
            (pointerRef.current.targetY - pointerRef.current.y) * 0.045;
          drawFrame((now - startTime) * 0.001 + 2.4);
        }
        rafId = window.requestAnimationFrame(loop);
      };
      rafId = window.requestAnimationFrame(loop);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      io.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#080910]"
    >
      {/* Edge-to-Edge Fallback Gradient Surface */}
      <FluidFallbackBackdrop />

      {/* Full-Viewport Flowing Liquid-Glass & Iridescent Silk WebGL Layer */}
      {webglReady ? (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            style={{ display: "block" }}
          />
        </motion.div>
      ) : null}

      {/* Secondary Atmospheric Parallax Light Sheen (Layered Speed) */}
      <motion.div
        style={shouldReduceMotion ? undefined : { x: sheenX, y: sheenY }}
        className="absolute -inset-8 opacity-70 mix-blend-screen"
      >
        <div
          className="h-full w-full"
          style={{
            background: `
              radial-gradient(ellipse 46% 32% at 86% 22%, rgba(255, 129, 93, 0.16) 0%, transparent 65%),
              radial-gradient(ellipse 44% 38% at 54% 48%, rgba(84, 217, 255, 0.09) 0%, transparent 68%),
              radial-gradient(ellipse 48% 40% at 16% 74%, rgba(227, 68, 197, 0.12) 0%, transparent 68%)
            `,
          }}
        />
      </motion.div>

      {/* Bottom Edge Seamless Fade into #080910 Page Canvas */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(8, 9, 16, 0.68) 65%, #080910 100%)",
        }}
      />
    </div>
  );
}
