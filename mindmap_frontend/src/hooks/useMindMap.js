import { useState, useEffect } from "react"
import initialData from "../data/mindmap.json"

/* ---------- HELPERS ---------- */

/* Update node data (title / summary) */
function updateNode(node, updated) {
  if (node.id === updated.id) return updated

  return {
    ...node,
    children: node.children.map((child) =>
      updateNode(child, updated)
    )
  }
}

/* Collapse entire subtree */
function collapseAll(node) {
  return {
    ...node,
    collapsed: true,
    children: node.children.map(collapseAll)
  }
}

/* Toggle expand / collapse (CORRECT LOGIC) */
function toggleNode(node, targetId) {
  if (node.id === targetId) {
    // 🔒 If node is open → collapse everything under it
    if (!node.collapsed) {
      return collapseAll(node)
    }

    // 🔓 If node is closed → open ONLY this node
    return {
      ...node,
      collapsed: false,
      children: node.children.map((child) =>
        collapseAll(child)
      )
    }
  }

  return {
    ...node,
    children: node.children.map((child) =>
      toggleNode(child, targetId)
    )
  }
}

/* ---------- HOOK ---------- */
export function useMindMap() {
  const [tree, setTree] = useState(() => {
    const saved = localStorage.getItem("mindmap-data")
    return saved ? JSON.parse(saved) : initialData
  })

  const [selectedNode, setSelectedNode] = useState(null)

  /* 💾 Persist edits */
  useEffect(() => {
    localStorage.setItem(
      "mindmap-data",
      JSON.stringify(tree)
    )
  }, [tree])

  /* Expand / collapse */
  const toggleCollapse = (node) => {
    setTree((prev) => toggleNode(prev, node.id))
    setSelectedNode(node)
  }

  /* Manual edit */
  const updateSelectedNode = (updatedNode) => {
    setTree((prev) => updateNode(prev, updatedNode))
    setSelectedNode(updatedNode)
  }

  /* 🔄 Reset to original JSON */
  const resetMindMap = () => {
    localStorage.removeItem("mindmap-data")
    setTree(initialData)
    setSelectedNode(null)
  }

  return {
    tree,
    selectedNode,
    toggleCollapse,
    updateSelectedNode,
    resetMindMap
  }
}
