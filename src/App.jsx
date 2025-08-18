import React, { useRef, useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import StickyNode from "./StickyNode";

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 불러오기시 label 업데이트
  const handleChangeLabel = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
      )
    );
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    sticky: (props) => (
      <StickyNode
        {...props}
        onChangeLabel={handleChangeLabel}
      />
    ),
  }), [handleChangeLabel]);

  const rf = useReactFlow();
  const idRef = useRef(1);
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);

  /* 노드 추가 */
  const addNote = useCallback(() => {
    const el = wrapperRef.current;

    const rect = el.getBoundingClientRect();
    const centerClient = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const pos = rf.screenToFlowPosition(centerClient);

    const id = String(idRef.current++);
    setNodes((nds) =>
      nds.concat({
        id,
        type: "sticky",
        position: { x: pos.x, y: pos.y - 50 },
        data: { label: "메모" },
      })
    );
  }, [rf, setNodes]);

  /* 엣지 추가 */
  const onConnect = useCallback((connection) => {
    if (connection.source === connection.target) return;

    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 2 },
        },
        eds
      )
    );
  }, [setEdges]);

  /* 노드 전체 삭제 */
  const clearAll = useCallback(() => {
    if (window.confirm("정말 모두 지우겠습니까?")) {
      setNodes([]);
      setEdges([]);
      idRef.current = 1;
    }
  }, [setNodes, setEdges]);

  /* 엣지 더블클릭시 삭제 */
  const onEdgeDoubleClick = useCallback(
    (evt, edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  // 파일로 저장
  const saveToFile = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "noten-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 파일에서 불러오기
  const loadFromFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
          setNodes(data.nodes);
          setEdges(data.edges);
        } else {
          alert("잘못된 파일 형식입니다.");
        }
      } catch {
        alert("파일을 읽을 수 없습니다.");
      }
      e.target.value = ""; // 추가: 같은 파일도 다시 선택 가능하게
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        // 선택된 노드 삭제
        setNodes((nds) => nds.filter((nd) => !nd.selected));
        // 선택된 엣지 삭제 (기존 코드)
        setEdges((eds) => eds.filter((ed) => !ed.selected));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setNodes, setEdges]);

  return (
    <div className="app" ref={wrapperRef}>
      <aside className="sidebar">
        <h1 className="logo">Noten</h1>
        <div className="buttons-section">
          <button className="add-button" onClick={addNote}>
            + 새 메모
          </button>
          <button className="delete-button" onClick={clearAll}>
            모두 지우기
          </button>
          <button onClick={saveToFile} className="save-button">저장</button>
          <button
            type="button"
            className="load-button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            불러오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={loadFromFile}
          />
        </div>

        <div className="hint">
          <p>💡 새 메모를 눌러 메모를 생성하세요</p>
          <p>🖱️ 메모를 더블클릭해 내용을 변경하세요</p>
          <p>🖱️ 드래그로 이동, 휠로 줌</p>
        </div>
      </aside>

      <main className="canvas">
        <ReactFlow
          ref={(instance) => {
            if (instance) window.reactFlowInstance = instance;
          }}
          nodeTypes={nodeTypes}
          nodeOrigin={[0.5, 0.5]}
          onConnect={onConnect}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeDoubleClick={onEdgeDoubleClick}
          connectionMode={ConnectionMode.Loose}
          defaultViewport={{ x: 0, y: 0, zoom: 2 }}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </main>
    </div>
  );
}
