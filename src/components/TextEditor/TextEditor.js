import React, { useEffect, useCallback, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // toggled buttons

  [{ list: "ordered" }, { list: "bullet" }],

  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

const TextEditor = () => {
  const [quill, setQuill] = useState();
  const [socket, setSocket] = useState();
  const { documentId } = useParams();

  // Connection to the WebSocket server
  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);
    return () => s.close();
  }, []);

  // Creating a quill editor ones the page loaded
  const wrapper = useCallback((targetDiv) => {
    if (!targetDiv) return;
    targetDiv.innerHTML = "";
    const div = document.createElement("div");
    targetDiv.appendChild(div);
    const q = new Quill(div, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  useEffect(() => {
    if (!quill || !socket) return;

    socket.once("load-content", (content) => {
      quill.setContents(content);
      quill.enable();
    });

    socket.emit("get-document", documentId);
  }, [quill, socket, documentId]);

  useEffect(() => {
    if (!quill || !socket) return;

    const interval = setInterval(() => {
      socket.emit("save-content", quill.getContents());
    }, 2000);
    return () => clearInterval(interval);
  }, [quill, socket]);

  // Emiting an event "textChangeEvent" to the server with the inserted delta
  useEffect(() => {
    if (!quill || !socket) return;

    const handleTextChange = (delta, oldDetla, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handleTextChange);

    return () => quill.off("text-change", handleTextChange);
  }, [quill, socket]);

  // Listening to "recevice-changes" and updating the current editor with the received delta
  useEffect(() => {
    if (!quill || !socket) return;

    const handlerSettingContent = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("recevice-changes", handlerSettingContent);
    return () => socket.off("recevice-changes");
  }, [quill, socket]);

  return <div id="editor-container" ref={wrapper}></div>;
};

export default TextEditor;
