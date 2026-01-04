import React from "react"

const SidePanel = ({ node, onUpdate, onReset }) => {
  if (!node) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center text-muted">
        <div className="text-center">
          <h6>No node selected</h6>
          <p className="small">Click a node to edit details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-100 p-3">
      <div className="card h-100 border-0 shadow-sm">
        {/* Header */}
        <div className="card-header bg-white border-bottom">
          <h5 className="mb-0">Node Details</h5>
          <small className="text-muted">Edit node information</small>
        </div>

        {/* Body */}
        <div className="card-body overflow-auto">
          <div className="mb-3">
            <label className="form-label fw-semibold">Title</label>
            <input
              className="form-control"
              value={node.title}
              onChange={(e) =>
                onUpdate({ ...node, title: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Summary</label>
            <textarea
              className="form-control"
              rows="5"
              value={node.summary}
              onChange={(e) =>
                onUpdate({ ...node, summary: e.target.value })
              }
            />
          </div>

          <div className="mt-4">
            <h6 className="text-muted">Metadata</h6>
            <ul className="list-unstyled small text-muted">
              <li><strong>ID:</strong> {node.id}</li>
              <li><strong>Children:</strong> {node.children?.length || 0}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white border-top">
          <small className="text-muted d-block text-center mb-2">
            Changes are saved automatically
          </small>

          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={() => {
              if (
                window.confirm(
                  "Reset all changes and restore original data?"
                )
              ) {
                onReset()
              }
            }}
          >
            Reset Mindmap Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default SidePanel
