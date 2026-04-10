import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
  type ReactFlowInstance,
  MarkerType,
  ConnectionMode,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CanvasProvider } from './context/CanvasContext'
import { NoteNode } from './components/NoteNode'
import { FloatingEdge } from './components/FloatingEdge'
import { SnapGuides } from './components/SnapGuides'
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher'
import { MarkdownEditor } from './components/MarkdownEditor'
import { useProjects, loadProjectData, saveProjectNodes, saveProjectEdges } from './hooks/useProjects'
import { useSnapToNodes } from './hooks/useSnapToNodes'
import { usePaneDoubleClick } from './hooks/usePaneDoubleClick'
import './styles/canvas.css'

const nodeTypes: NodeTypes = { note: NoteNode }
const edgeTypes: EdgeTypes = { floating: FloatingEdge }

const defaultEdgeOptions = {
  type: 'floating',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#666' },
  style: { stroke: '#666', strokeWidth: 2 },
}

let nodeId = 0
function getNextId() {
  return `node-${++nodeId}`
}

function restoreNodeId(nodes: Node[]) {
  const maxId = nodes.reduce((max, n) => {
    const num = parseInt(n.id.replace('node-', ''), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  nodeId = maxId
}

export default function App() {
  const {
    projects,
    activeProject,
    activeId,
    loading,
    switchProject,
    createProject,
    renameProject,
    deleteProject,
  } = useProjects()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [autoEditId, setAutoEditId] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const rfInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null)
  const getNodes = useCallback(() => rfInstance.current?.getNodes() ?? [], [])
  const { guides, onNodeDrag, onNodeDragStop } = useSnapToNodes(getNodes)

  // Load nodes/edges when activeId changes
  const prevActiveId = useRef<string | null>(null)
  useEffect(() => {
    if (!activeId || loading) return
    if (prevActiveId.current === activeId) return
    prevActiveId.current = activeId
    setDataLoaded(false)
    loadProjectData(activeId).then((data) => {
      setNodes(data.nodes)
      setEdges(data.edges)
      restoreNodeId(data.nodes)
      setEditingNodeId(null)
      setEditingText('')
      setDataLoaded(true)
    })
  }, [activeId, loading, setNodes, setEdges])

  // Debounced persistence to D1
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const skipPersist = useRef(true)

  useEffect(() => {
    if (skipPersist.current || !dataLoaded || !activeId) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveProjectNodes(activeId, nodes)
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [nodes, activeId, dataLoaded])

  const edgeSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    if (skipPersist.current || !dataLoaded || !activeId) return
    clearTimeout(edgeSaveTimer.current)
    edgeSaveTimer.current = setTimeout(() => {
      saveProjectEdges(activeId, edges)
    }, 500)
    return () => clearTimeout(edgeSaveTimer.current)
  }, [edges, activeId, dataLoaded])

  // Enable persistence after first data load
  useEffect(() => {
    if (dataLoaded) skipPersist.current = false
  }, [dataLoaded])

  // Double-click canvas → new note
  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!rfInstance.current) return
      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const id = getNextId()
      const newNode: Node = {
        id,
        type: 'note',
        position: { x: position.x - 40, y: position.y - 14 },
        data: { title: '', text: '', color: '#444' },
        style: { width: 80 },
      }
      setNodes((nds) => [...nds, newNode])
      setAutoEditId(id)
    },
    [setNodes]
  )
  const onPaneClick = usePaneDoubleClick(handlePaneDoubleClick)

  const onUpdateNodeData = useCallback(
    (nid: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nid ? { ...n, data: { ...n.data, ...data } } : n
        )
      )
    },
    [setNodes]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (_event.metaKey || _event.ctrlKey) {
        setEditingText((node.data as { text?: string }).text ?? '')
        setEditingNodeId(node.id)
      }
    },
    []
  )

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setAutoEditId(node.id)
    },
    []
  )

  const handleSave = useCallback(
    (newText: string) => {
      if (!editingNodeId) return
      setNodes((nds) =>
        nds.map((n) =>
          n.id === editingNodeId ? { ...n, data: { ...n.data, text: newText } } : n
        )
      )
    },
    [editingNodeId, setNodes]
  )

  const handleCloseEditor = useCallback(() => {
    setEditingNodeId(null)
    setEditingText('')
  }, [])

  const clearAutoEdit = useCallback(() => setAutoEditId(null), [])

  const canvasContext = useMemo(
    () => ({ updateNodeData: onUpdateNodeData, autoEditId, clearAutoEdit }),
    [onUpdateNodeData, autoEditId, clearAutoEdit]
  )

  if (loading || !activeProject) {
    return <div className="canvas-container" />
  }

  return (
    <CanvasProvider value={canvasContext}>
    <div className="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={onPaneClick}
        nodesConnectable={false}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        zoomOnDoubleClick={false}
        onInit={(instance) => {
          rfInstance.current = instance
          restoreNodeId(nodes)
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        edgesFocusable
        edgesReconnectable
        deleteKeyCode={['Backspace', 'Delete']}
        fitView={nodes.length > 0}
        fitViewOptions={{ maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <SnapGuides guides={guides} />
        <Background gap={24} size={1.5} color="#333" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#444"
          maskColor="rgba(0,0,0,0.7)"
          style={{ background: '#1a1a1a', border: '1px solid #333' }}
        />
      </ReactFlow>
      <WorkspaceSwitcher
        projects={projects}
        activeProject={activeProject}
        onSwitch={switchProject}
        onCreate={createProject}
        onRename={renameProject}
        onDelete={deleteProject}
      />
      <button
        className="logout-btn"
        onClick={() => { window.location.href = '/api/auth/logout' }}
      >
        Sign out
      </button>
      {editingNodeId && (
        <MarkdownEditor
          text={editingText}
          onSave={handleSave}
          onClose={handleCloseEditor}
        />
      )}
    </div>
    </CanvasProvider>
  )
}
