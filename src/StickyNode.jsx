import React, { useState, useRef, useEffect } from "react";
import { Handle, Position } from "reactflow";

function darken(hex, factor = 0.9) {
  // hex: "#RRGGBB"
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  let r = Math.floor(((num >> 16) & 0xff) * factor);
  let g = Math.floor(((num >> 8) & 0xff) * factor);
  let b = Math.floor((num & 0xff) * factor);
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export default function StickyNode({ data, selected, id, onChangeLabel }) {
  const isMobile = window.innerWidth <= 600;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(data.label || "메모");
  const inputRef = useRef(null);

  // 불러오기시 label 업데이트
  useEffect(() => {
    setValue(data.label !== undefined ? data.label : "메모");
  }, [data.label]);

  // 편집 모드 진입 시 input에 포커스
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // textarea 높이 자동 조절
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.style.height = "auto"; // 높이 초기화
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [value, editing]);

  // 더블클릭 시 편집 모드
  function handleDoubleClick(e) {
    console.log("더블클릭 이벤트 발생");
    e.stopPropagation();
    setEditing(true);
  }

  // 값 변경
  function handleChange(e) {
    setValue(e.target.value);
    if (onChangeLabel) {
      onChangeLabel(id, e.target.value);
    }
  }

  return (
    <div
      style={{
        background: data.color || "#FFF9C4",
        padding: 10,
        borderRadius: 8,
        border: selected ? "2.5px solid #747474ff" : "1px solid #ccc",
        width: 180,
        boxShadow: "0 2px 6px rgba(0,0,0,.06)",
        textAlign: "center",
        cursor: "pointer",
        userSelect: "auto",
        fontFamily: "Noto Sans KR, sans-serif",
        fontWeight: data.bold ? "bold" : 400,
        fontStyle: data.italic ? "italic" : "normal",
        textDecoration: data.strike ? "line-through" : "none",
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          whiteSpace: "pre-line",
          wordBreak: "break-all",
        }}
      >
        {editing ? (
          <textarea
            key={editing ? "editing" : "not-editing"}
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onBlur={() => setEditing(false)}
            className="nodrag nopan nowheel"
            style={{
              width: "100%",
              minHeight: 40,
              border: "0px solid #ccc",
              borderRadius: 4,
              resize: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              background: darken(data.color || "#FFF9C4", 0.95),
              outline: "none",
              overflow: "hidden",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          value
        )}
      </div>

      {/* 연결 포인트들 */}
      <Handle type="source" position={Position.Top} id="s-top" className="react-flow__handle" style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }} />
      <Handle type="source" position={Position.Right} id="s-right" className="react-flow__handle" style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }}/>
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="react-flow__handle" style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }}/>
      <Handle type="source" position={Position.Left} id="s-left" className="react-flow__handle" style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }}/>

      <Handle
        type="target"
        position={Position.Top}
        id="t-top"
        isConnectableStart={false}
        className="react-flow__handle"
        style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="t-right"
        className="react-flow__handle"
        isConnectableStart={false}
        style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="t-bottom"
        isConnectableStart={false}
        className="react-flow__handle"
        style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="t-left"
        isConnectableStart={false}
        className="react-flow__handle"
        style={{ backgroundColor: isMobile ? darken(data.color, 0.8) : darken(data.color, 0.4) }}
      />
    </div>
  );
}
