"use client";
import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 1600 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Parse numeric part and suffix
    const match = value.match(/^([\d.,]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const rawNumStr = match[1].replace(/,/g, "");
    const targetNum = parseFloat(rawNumStr);
    const suffix = match[2] || "";

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            const startTime = performance.now();

            const update = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out quart
              const easeOut = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(easeOut * targetNum);

              setDisplayValue(`${current.toLocaleString("id-ID")}${suffix}`);

              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                setDisplayValue(value);
              }
            };

            requestAnimationFrame(update);
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentElem = elementRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [value, duration, hasAnimated]);

  return <span ref={elementRef}>{displayValue}</span>;
}
