import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Dark forest panel with layered paper-cut waves, after the
 * "Pushing Boundaries" block in the reference.
 */
export function WavePanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-panel bg-pine shadow-lift', className)}>
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="wave-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#141d0d" floodOpacity="0.55" />
          </filter>
        </defs>
        <rect width="1200" height="600" fill="#26361a" />
        <g filter="url(#wave-shadow)">
          <path
            fill="#8ea36a"
            d="M0 0h1200v120c-90 40-170-30-270-10s-150 80-260 60-170-90-290-70S200 190 110 170 30 110 0 120z"
          />
        </g>
        <g filter="url(#wave-shadow)">
          <path
            fill="#6f8446"
            d="M0 0h1200v70c-110 30-190-30-300-20S720 130 610 110 440 40 330 60 150 140 70 120 20 80 0 90z"
          />
        </g>
        <g filter="url(#wave-shadow)">
          <path
            fill="#566b35"
            d="M0 600h1200V470c-80-40-160 20-250 10s-160-70-270-50-170 90-280 70-170-60-250-40S40 500 0 480z"
          />
        </g>
        <g filter="url(#wave-shadow)">
          <path
            fill="#3a4f25"
            d="M0 600h1200v-70c-100-30-180 30-290 20s-170-60-280-40-160 60-270 40S110 500 0 540z"
          />
        </g>
        <g filter="url(#wave-shadow)">
          <path fill="#e4dbc5" d="M0 600h1200v-22c-140-26-260 14-400 6s-250-34-390-20S150 590 0 572z" />
        </g>
      </svg>
      {children}
    </div>
  )
}
