import React from 'react'

export function LeafSprig({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 480"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      fill="none"
      stroke="currentColor"
    >
      <g className="text-primary/55" strokeWidth="1.6" strokeLinecap="round">
        <path d="M50 470 C 55 380 45 300 60 240 C 72 195 95 165 120 130 C 150 90 175 60 205 25" />

        <g>
          <path d="M65 235 C 40 220 20 195 12 165 C 30 175 45 185 65 235 Z" />
          <path d="M14 168 C 30 185 45 205 63 232" strokeWidth="0.9" />
          <path
            d="M20 178 L 34 190 M26 190 L 40 202 M33 202 L 46 213 M40 213 L 52 223"
            strokeWidth="0.6"
            opacity="0.7"
          />
        </g>

        <g>
          <path d="M62 232 C 90 226 118 232 138 255 C 112 258 88 252 62 232 Z" />
          <path d="M65 233 C 92 236 116 242 136 254" strokeWidth="0.9" />
          <path
            d="M78 235 L 82 250 M90 236 L 96 252 M103 240 L 110 254 M116 245 L 124 256"
            strokeWidth="0.6"
            opacity="0.7"
          />
        </g>

        <g>
          <path d="M58 300 C 28 292 4 272 -8 244 C 16 250 34 262 58 300 Z" />
          <path d="M-6 247 C 14 262 34 280 56 298" strokeWidth="0.9" />
          <path
            d="M0 256 L 15 267 M8 267 L 23 278 M17 278 L 31 288 M27 288 L 40 297"
            strokeWidth="0.6"
            opacity="0.7"
          />
        </g>

        <g>
          <path d="M120 128 C 148 110 182 108 210 122 C 184 134 154 140 120 128 Z" />
          <path d="M124 126 C 152 118 180 116 206 122" strokeWidth="0.9" />
          <path
            d="M136 118 L 140 130 M150 114 L 155 128 M165 113 L 171 128 M180 114 L 187 129"
            strokeWidth="0.6"
            opacity="0.7"
          />
        </g>

        <g>
          <path d="M150 88 C 168 60 198 44 230 42 C 212 68 184 84 150 88 Z" />
          <path d="M154 86 C 176 70 200 56 227 45" strokeWidth="0.9" />
          <path
            d="M166 74 L 178 68 M175 62 L 187 57 M186 52 L 197 48 M198 45 L 209 42"
            strokeWidth="0.6"
            opacity="0.7"
          />
        </g>

        <g>
          <path d="M55 358 C 24 353 -3 336 -18 310 C 8 313 30 322 55 358 Z" />
          <path d="M-15 313 C 6 326 28 342 52 357" strokeWidth="0.9" />
        </g>

        <g>
          <path d="M45 415 C 15 412 -10 397 -25 373 C 0 374 22 382 45 415 Z" />
        </g>
      </g>

      <g className="text-primary/25" strokeWidth="1.2" strokeLinecap="round">
        <path d="M78 460 C 82 385 76 320 90 268 C 100 232 118 208 138 178" />
        <path d="M96 262 C 74 250 58 228 52 202 C 72 210 86 222 96 262 Z" />
        <path d="M92 264 C 112 260 132 264 146 280 C 126 282 108 278 92 264 Z" />
        <path d="M140 180 C 160 166 184 164 204 174 C 186 184 164 188 140 180 Z" />
      </g>
    </svg>
  )
}
