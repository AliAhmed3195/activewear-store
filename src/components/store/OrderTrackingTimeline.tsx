"use client";

import { useEffect, useState } from "react";
import type { TrackingViewModel } from "@/lib/order-tracking";
import { IconCheck } from "@/components/ui/icons";

function StepIcon({ state }: { state: TrackingViewModel["steps"][number]["state"] }) {
  if (state === "complete") {
    return (
      <span className="track-step-icon track-step-icon--complete" aria-hidden="true">
        <IconCheck size={14} />
      </span>
    );
  }
  if (state === "current") {
    return <span className="track-step-icon track-step-icon--current" aria-hidden="true" />;
  }
  if (state === "skipped") {
    return <span className="track-step-icon track-step-icon--skipped" aria-hidden="true" />;
  }
  return <span className="track-step-icon track-step-icon--upcoming" aria-hidden="true" />;
}

export default function OrderTrackingTimeline({
  model,
  animate = true,
}: {
  model: TrackingViewModel;
  animate?: boolean;
}) {
  const [progress, setProgress] = useState(animate ? 0 : model.progressPercent);

  useEffect(() => {
    if (!animate) {
      setProgress(model.progressPercent);
      return;
    }
    const t = requestAnimationFrame(() => setProgress(model.progressPercent));
    return () => cancelAnimationFrame(t);
  }, [animate, model.progressPercent]);

  return (
    <div
      className={`order-track-timeline${model.isException ? " order-track-timeline--exception" : ""}`}
      role="list"
      aria-label="Order progress"
    >
      <div className="order-track-progress" aria-hidden="true">
        <div className="order-track-progress-track">
          <div
            className="order-track-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="order-track-progress-label">
          <span>{model.statusLabel}</span>
          <span className="order-track-progress-pct">{progress}%</span>
        </p>
      </div>

      <p className="order-track-headline">{model.statusHeadline}</p>

      <ol className="order-track-steps">
        {model.steps.map((step, index) => (
          <li
            key={step.key}
            className={`order-track-step order-track-step--${step.state}`}
            role="listitem"
            style={{ animationDelay: animate ? `${index * 70}ms` : undefined }}
          >
            <div className="order-track-step-rail">
              <StepIcon state={step.state} />
              {index < model.steps.length - 1 && (
                <span
                  className={`order-track-step-line order-track-step-line--${step.state === "complete" ? "complete" : "idle"}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="order-track-step-copy">
              <p className="order-track-step-title">{step.label}</p>
              <p className="order-track-step-desc">{step.description}</p>
              {step.state === "current" && (
                <span className="order-track-step-badge">Current step</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
