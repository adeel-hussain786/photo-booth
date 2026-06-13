import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/* ── custom cursor ── */
const dot  = Object.assign(document.createElement("div"), { className:"cur-dot"  });
const ring = Object.assign(document.createElement("div"), { className:"cur-ring" });
document.body.append(dot, ring);

let mx=0, my=0, rx=0, ry=0;
document.addEventListener("mousemove", e => { mx=e.clientX; my=e.clientY; });

function loop() {
  dot.style.left  = mx+"px";
  dot.style.top   = my+"px";
  rx += (mx-rx)*.18;
  ry += (my-ry)*.18;
  ring.style.left = rx+"px";
  ring.style.top  = ry+"px";
  requestAnimationFrame(loop);
}
loop();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
