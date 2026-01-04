import React, { useState, useRef, useLayoutEffect } from "react"

const NODE_RADIUS = 55
const H_GAP = 240
const V_GAP = 180

/* ---------- PREVIEW TEXT (TOOLTIP ONLY) ---------- */
function getPreviewText(text, maxLength = 70) {
  if (!text) return ""
  return text.length > maxLength
    ? text.slice(0, maxLength) + "…"
    : text
}

/* ---------- TEXT WRAPPING (NODE TITLE) ---------- */
function wrapText(text, maxCharsPerLine = 10, maxLines = 2) {
  const words = text.split(" ")
  const lines = []
  let currentLine = ""

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine += (currentLine ? " " : "") + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })

  if (currentLine) lines.push(currentLine)

  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] += "…"
  }

  return lines
}

/* ---------- SUBTREE HEIGHT ---------- */
function getSubtreeHeight(node) {
  if (node.collapsed || node.children.length === 0) {
    return V_GAP
  }
  return node.children.reduce(
    (sum, child) => sum + getSubtreeHeight(child),
    0
  )
}

/* ---------- TREE RENDER ---------- */
function renderTree(
  node,
  x,
  y,
  onToggle,
  setTooltip,
  selectedId,
  elements = []
) {
  const isSelected = node.id === selectedId

  /* ---- NODE ---- */
  elements.push(
    <g
      key={node.id}
      onClick={() => onToggle(node)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)"
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          text: getPreviewText(node.summary)
        })
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)"
        setTooltip(null)
      }}
      style={{
        cursor: "pointer",
        transition: "transform 0.15s ease"
      }}
    >
      <circle
        cx={x}
        cy={y}
        r={NODE_RADIUS}
        fill={isSelected ? "url(#selectedGradient)" : "url(#nodeGradient)"}
        stroke={isSelected ? "#dc2626" : "rgba(0,0,0,0.15)"}
        strokeWidth={isSelected ? 3 : 1}
        style={{
          filter: isSelected
            ? "drop-shadow(0px 0px 14px rgba(220,38,38,0.6))"
            : "drop-shadow(0px 4px 8px rgba(0,0,0,0.25))"
        }}
      />

      <text
        x={x}
        y={y}
        fill="white"
        fontSize="14"
        fontWeight="500"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {wrapText(node.title).map((line, i) => (
          <tspan key={i} x={x} dy={i === 0 ? "-0.35em" : "1.2em"}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )

  if (node.collapsed) return elements

  /* ---- CHILDREN ---- */
  let offsetY = y - getSubtreeHeight(node) / 2

  node.children.forEach((child) => {
    const childHeight = getSubtreeHeight(child)
    const childX = x + H_GAP
    const childY = offsetY + childHeight / 2

    elements.push(
      <line
        key={`${node.id}-${child.id}`}
        x1={x + NODE_RADIUS}
        y1={y}
        x2={childX - NODE_RADIUS}
        y2={childY}
        stroke={isSelected ? "#ef4444" : "#cbd5e1"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    )

    renderTree(
      child,
      childX,
      childY,
      onToggle,
      setTooltip,
      selectedId,
      elements
    )

    offsetY += childHeight
  })

  return elements
}

/* ---------- COMPONENT ---------- */
const MindMap = ({ data, onToggle, selectedId }) => {
  const svgRef = useRef(null)
  const groupRef = useRef(null)

  const [viewBox, setViewBox] = useState("0 0 1000 1000")
  const [tooltip, setTooltip] = useState(null)

  /* ---------- FIT TO VIEW (REUSED) ---------- */
  const fitToView = () => {
    if (!groupRef.current) return

    const bbox = groupRef.current.getBBox()

    const BASE_PADDING = 180
    const MAX_PADDING = 350

    const padding = Math.min(
      MAX_PADDING,
      Math.max(BASE_PADDING, Math.min(bbox.width, bbox.height) * 0.15)
    )

    const x = bbox.x - padding
    const y = bbox.y - padding
    const width = bbox.width + padding * 2
    const height = bbox.height + padding * 2

    setViewBox(`${x} ${y} ${width} ${height}`)
  }

  /* ---------- AUTO FIT ON DATA CHANGE ---------- */
  useLayoutEffect(() => {
    fitToView()
  }, [JSON.stringify(data)])

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {/* Fit to View Button */}
      <button
        className="btn btn-primary btn-sm"
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
        }}
        onClick={fitToView}
      >
        Fit to View
      </button>

      {/* SVG */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="nodeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="selectedGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        <g ref={groupRef}>
          {renderTree(
            data,
            0,
            0,
            onToggle,
            setTooltip,
            selectedId
          )}
        </g>
      </svg>

      {/* Tooltip (PREVIEW ONLY) */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y + 12,
            left: tooltip.x + 12,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(6px)",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            pointerEvents: "none",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            maxWidth: "220px", 
            lineHeight: "1.4"
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

export default MindMap
