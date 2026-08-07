import React from 'react'

export function FloatingLeaf({
  className,
  rotate = 0,
  scale = 1,
}: {
  className?: string
  rotate?: number
  scale?: number
}) {
  return (
    <svg
      viewBox="0 0 160 220"
      className={className}
      fill="none"
      stroke="currentColor"
      style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
    >
      {/* Main leaf body */}
      <path
        d="M80 210 C 60 170 20 130 10 85 C 2 50 20 18 50 8 C 65 3 80 5 95 8 C 125 18 145 50 138 85 C 128 130 100 170 80 210 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/50"
      />
      {/* Central vein */}
      <path
        d="M80 210 C 78 165 72 120 70 75 C 69 50 72 28 80 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-primary/60"
      />
      {/* Left lateral veins */}
      <path
        d="M76 165 C 60 155 42 148 28 140"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.65"
        className="text-primary/60"
      />
      <path
        d="M74 140 C 56 128 38 118 22 108"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.65"
        className="text-primary/60"
      />
      <path
        d="M72 112 C 56 100 40 90 28 78"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.65"
        className="text-primary/60"
      />
      <path
        d="M71 85 C 58 72 46 62 36 50"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.6"
        className="text-primary/60"
      />
      <path
        d="M73 60 C 64 48 58 36 55 24"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.55"
        className="text-primary/60"
      />
      {/* Right lateral veins */}
      <path
        d="M78 165 C 96 155 114 148 128 140"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.65"
        className="text-primary/60"
      />
      <path
        d="M77 140 C 96 128 114 118 130 108"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.65"
        className="text-primary/60"
      />
      <path
        d="M76 112 C 94 100 110 90 122 78"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.65"
        className="text-primary/60"
      />
      <path
        d="M75 85 C 90 72 104 62 116 50"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.6"
        className="text-primary/60"
      />
      <path
        d="M76 60 C 86 48 94 36 98 24"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.55"
        className="text-primary/60"
      />
    </svg>
  )
}
