import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPARKLE_GLINTS = [
  { id: "g1", className: "left-[2%] top-[14%] h-4 w-4", delay: 0 },
  { id: "g2", className: "left-[43%] top-[6%] h-3.5 w-3.5", delay: 1.8 },
  { id: "g3", className: "right-[14%] bottom-[16%] h-3.5 w-3.5", delay: 3.1 },
];

export default function LiquidChromeText({
  children,
  variant = "hero",
  className = "",
}) {
  const rawId = useId();
  const filterId = `liquid-chrome-3d-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const shouldReduceMotion = useReducedMotion();
  const isHero = variant === "hero";

  return (
    <span className={`relative inline-block font-extrabold ${className}`}>
      {/* Inline SVG 3D Normal-Map & Multi-Specular Chrome Lighting Filter */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      >
        <defs>
          <filter
            id={filterId}
            x="-22%"
            y="-32%"
            width="144%"
            height="164%"
            colorInterpolationFilters="sRGB"
          >
            {/* 1. Convert glyph alpha into a smooth inflated 3D heightfield */}
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation={isHero ? "4.6" : "2.6"}
              result="heightMap"
            />

            {/* 2. Deep metallic purple-slate 3D diffuse curvature shading */}
            <feDiffuseLighting
              in="heightMap"
              surfaceScale={isHero ? "5.2" : "3.6"}
              diffuseConstant="1.05"
              lightingColor="#C4B5FD"
              result="diffuseShade"
            >
              <feDistantLight azimuth="228" elevation="44" />
            </feDiffuseLighting>
            <feComposite
              in="diffuseShade"
              in2="SourceAlpha"
              operator="in"
              result="diffuseClipped"
            />
            <feComponentTransfer in="diffuseClipped" result="diffuseLifted">
              <feFuncR type="linear" slope="0.62" intercept="0.38" />
              <feFuncG type="linear" slope="0.62" intercept="0.32" />
              <feFuncB type="linear" slope="0.58" intercept="0.46" />
            </feComponentTransfer>
            <feBlend
              in="SourceGraphic"
              in2="diffuseLifted"
              mode="multiply"
              result="shadedChrome"
            />

            {/* 3. Primary bright silver-white inflated ridge specular */}
            <feSpecularLighting
              in="heightMap"
              surfaceScale={isHero ? "7.8" : "5.2"}
              specularConstant={isHero ? "1.85" : "1.35"}
              specularExponent={isHero ? "32" : "24"}
              lightingColor="#FFFFFF"
              result="specSilver"
            >
              <feDistantLight azimuth="224" elevation="52" />
            </feSpecularLighting>
            <feComposite
              in="specSilver"
              in2="SourceAlpha"
              operator="in"
              result="specSilverClipped"
            />

            {/* 4. Cool electric cyan (#54D9FF) upper-left metallic reflection */}
            <feSpecularLighting
              in="heightMap"
              surfaceScale={isHero ? "6.8" : "4.6"}
              specularConstant={isHero ? "1.25" : "0.95"}
              specularExponent="18"
              lightingColor="#54D9FF"
              result="specCyan"
            >
              <feDistantLight azimuth="140" elevation="28" />
            </feSpecularLighting>
            <feComposite
              in="specCyan"
              in2="SourceAlpha"
              operator="in"
              result="specCyanClipped"
            />

            {/* 5. Magenta (#E344C5) curved side reflection */}
            <feSpecularLighting
              in="heightMap"
              surfaceScale={isHero ? "6.6" : "4.4"}
              specularConstant={isHero ? "1.2" : "0.85"}
              specularExponent="16"
              lightingColor="#E344C5"
              result="specMagenta"
            >
              <feDistantLight azimuth="318" elevation="30" />
            </feSpecularLighting>
            <feComposite
              in="specMagenta"
              in2="SourceAlpha"
              operator="in"
              result="specMagentaClipped"
            />

            {/* 6. Warm orange (#FF815D) lower rim highlight */}
            <feSpecularLighting
              in="heightMap"
              surfaceScale={isHero ? "6.5" : "4.2"}
              specularConstant={isHero ? "0.95" : "0.7"}
              specularExponent="22"
              lightingColor="#FF815D"
              result="specOrange"
            >
              <feDistantLight azimuth="44" elevation="22" />
            </feSpecularLighting>
            <feComposite
              in="specOrange"
              in2="SourceAlpha"
              operator="in"
              result="specOrangeClipped"
            />

            {/* 7. Soft outer iridescent chrome aura + grounding shadow */}
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation={isHero ? "8" : "4"}
              result="auraBlur"
            />
            <feFlood
              floodColor="#702CFF"
              floodOpacity={isHero ? "0.34" : "0.22"}
              result="auraColor"
            />
            <feComposite
              in="auraColor"
              in2="auraBlur"
              operator="in"
              result="auraGlow"
            />

            <feOffset dx="0" dy={isHero ? "5" : "3"} in="SourceAlpha" result="shadowOffset" />
            <feGaussianBlur
              in="shadowOffset"
              stdDeviation={isHero ? "5" : "3"}
              result="shadowBlur"
            />
            <feFlood floodColor="#080910" floodOpacity="0.92" result="shadowColor" />
            <feComposite
              in="shadowColor"
              in2="shadowBlur"
              operator="in"
              result="contactShadow"
            />

            {/* 8. Screen-blend specular highlights onto shaded metallic chrome and clip cleanly */}
            <feBlend
              in="shadedChrome"
              in2="specMagentaClipped"
              mode="screen"
              result="lit1"
            />
            <feBlend
              in="lit1"
              in2="specCyanClipped"
              mode="screen"
              result="lit2"
            />
            <feBlend
              in="lit2"
              in2="specOrangeClipped"
              mode="screen"
              result="lit3"
            />
            <feBlend
              in="lit3"
              in2="specSilverClipped"
              mode="screen"
              result="litFinal"
            />
            <feComposite
              in="litFinal"
              in2="SourceAlpha"
              operator="in"
              result="litClipped"
            />

            <feMerge>
              <feMergeNode in="contactShadow" />
              <feMergeNode in="auraGlow" />
              <feMergeNode in="litClipped" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Wrapper carries SVG 3D lighting filter; inner span carries clipped metallic chrome surface */}
      <span
        className="relative inline-block"
        style={{ filter: `url(#${filterId})` }}
      >
        <span
          className={
            isHero ? "liquid-chrome-surface" : "liquid-chrome-surface--subtle"
          }
        >
          {children}
        </span>
      </span>

      {/* Subtle optical specular lens glints on hero centerpiece */}
      {isHero
        ? SPARKLE_GLINTS.map((glint) => (
            <motion.svg
              key={glint.id}
              aria-hidden="true"
              viewBox="0 0 24 24"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: [0.35, 0.92, 0.35],
                      scale: [0.88, 1.08, 0.88],
                    }
              }
              transition={{
                duration: 4.5,
                delay: glint.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`pointer-events-none absolute z-20 select-none ${glint.className}`}
            >
              <path
                d="M12 0 L13.4 10.6 L24 12 L13.4 13.4 L12 24 L10.6 13.4 L0 12 L10.6 10.6 Z"
                fill="#F5F1F0"
                fillOpacity="0.9"
              />
            </motion.svg>
          ))
        : null}
    </span>
  );
}
