import MindMap from "./components/MindMap"
import SidePanel from "./components/SidePanel"
import { useMindMap } from "./hooks/useMindMap"

export default function App() {
  const {
    tree,
    selectedNode,
    toggleCollapse,
    updateSelectedNode,
    resetMindMap
  } = useMindMap()

  return (
    <div
      className="container-fluid vh-100"
      style={{
        background: "linear-gradient(135deg, #f8fafc, #eef2ff)"
      }}
    >
      <div className="row h-100">
        {/* Mindmap */}
        <div
  className="col-9 border-end"
  style={{
    backgroundColor: "#f8fafc",
    backgroundImage: `
      linear-gradient(#e5e7eb 1px, transparent 1px),
      linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
    `,
    backgroundSize: "24px 24px"
  }}
>

          <MindMap
            data={tree}
            onToggle={toggleCollapse}
            selectedId={selectedNode?.id}
          />
        </div>

        {/* Side Panel */}
        <div
          className="col-3"
          style={{ background: "#f9fafb" }}
        >
          <SidePanel
            node={selectedNode}
            onUpdate={updateSelectedNode}
            onReset={resetMindMap}
          />
        </div>
      </div>
    </div>
  )
}
