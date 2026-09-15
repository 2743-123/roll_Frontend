import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  keyframes,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { sendAiCommandAction } from "../../../Actions/Auth/ai";

// 🌀 Cinematic HUD Keyframes
const spinForward = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const spinBackward = keyframes`
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
`;

const energyPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px #ffffff, 0 0 30px rgba(255,255,255,0.7), inset 0 0 10px #ffffff;
    transform: scale(0.96);
  }
  50% {
    box-shadow: 0 0 35px #ffffff, 0 0 65px rgba(255,255,255,0.9), inset 0 0 20px #ffffff;
    transform: scale(1.06);
  }
`;

const waveBar = keyframes`
  0%, 100% { height: 4px; opacity: 0.3; }
  50% { height: 28px; opacity: 1; filter: drop-shadow(0 0 8px #ffffff); }
`;

const holoScan = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(200%); }
`;

const AIAssistantDrawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "CORE_READY // Directives sunne ke liye active hoon. Command dijiye.",
    },
  ]);

  // 📍 Draggable Position State (Default: bottom-right)
  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 110 : 100,
    y: typeof window !== "undefined" ? window.innerHeight - 110 : 100,
  });

  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // 🖱️ Mouse / Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: position.x, y: position.y };

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    if (Math.hypot(deltaX, deltaY) > 4) {
      hasDraggedRef.current = true;
    }

    const newX = Math.max(10, Math.min(window.innerWidth - 86, elementStartPos.current.x + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - 86, elementStartPos.current.y + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    if (!hasDraggedRef.current) {
      setIsOpen(true);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const command = input;
    setInput("");
    setHistory((prev) => [...prev, { sender: "user", text: command }]);
    setLoading(true);

    try {
      const res = await dispatch(sendAiCommandAction(command));
      const aiReply = res?.msg || "DIRECTIVE PROCESSED.";
      setHistory((prev) => [
        ...prev,
        { sender: "ai", text: aiReply },
      ]);
    } catch (err: any) {
      const errorReply = err?.msg || "SIGNAL ABORTED: RETRY.";
      setHistory((prev) => [
        ...prev,
        { sender: "ai", text: errorReply },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= ⚡ MOVABLE ARC REACTOR TRIGGER ================= */}
      {!isOpen && (
        <Box
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          sx={{
            position: "fixed",
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1200,
            width: 76,
            height: 76,
            cursor: "grab",
            userSelect: "none",
            touchAction: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: isDraggingRef.current ? "none" : "transform 0.2s ease",
            "&:active": {
              cursor: "grabbing",
              transform: "scale(1.08)",
            },
            "&:hover": {
              transform: "scale(1.1)",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              bgcolor: "#030712",
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            }}
          />

          <Box
            component="svg"
            viewBox="0 0 100 100"
            sx={{
              position: "absolute",
              inset: 4,
              width: "calc(100% - 8px)",
              height: "calc(100% - 8px)",
              pointerEvents: "none",
              animation: `${spinForward} 8s linear infinite`,
            }}
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="30 25 60 15"
              style={{ filter: "drop-shadow(0 0 6px #ffffff)" }}
            />
          </Box>

          <Box
            component="svg"
            viewBox="0 0 100 100"
            sx={{
              position: "absolute",
              inset: 12,
              width: "calc(100% - 24px)",
              height: "calc(100% - 24px)",
              pointerEvents: "none",
              animation: `${spinBackward} 4s linear infinite`,
            }}
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2"
              strokeDasharray="12 18"
            />
          </Box>

          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              bgcolor: "#ffffff",
              pointerEvents: "none",
              animation: `${energyPulse} 2s infinite ease-in-out`,
            }}
          />
        </Box>
      )}

      {/* ================= 🛸 FLOATING CINEMATIC HOLO-TERMINAL ================= */}
      {isOpen && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: { xs: "calc(100% - 48px)", sm: 460 },
            height: 620,
            zIndex: 1300,
            borderRadius: 6,
            bgcolor: "#060913",
            color: "#ffffff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            border: "1.5px solid rgba(255, 255, 255, 0.35)",
            boxShadow: `
              0 25px 60px -15px rgba(0, 0, 0, 0.7),
              0 0 45px rgba(255, 255, 255, 0.25),
              inset 0 0 30px rgba(255, 255, 255, 0.04)
            `,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "35%",
              background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)",
              pointerEvents: "none",
              zIndex: 1,
              animation: `${holoScan} 5s linear infinite`,
            }}
          />

          <Box
            sx={{
              p: 2.2,
              px: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.8}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: "#ffffff",
                  boxShadow: "0 0 12px #ffffff",
                  animation: `${energyPulse} 1.5s infinite ease-in-out`,
                }}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: 2,
                    color: "#ffffff",
                  }}
                >
                  JARVIS // PROTOCOL
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.62rem",
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: 1,
                  }}
                >
                  QUANTUM STREAM ACTIVE
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{
                color: "rgba(255,255,255,0.6)",
                p: 0.8,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                "&:hover": { color: "#fff", borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              zIndex: 2,
              "&::-webkit-scrollbar": { width: 3 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
          >
            {history.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: 1.5,
                    mb: 0.5,
                  }}
                >
                  {msg.sender === "user" ? "[USER_DIR]" : "[NEURAL_REPLY]"}
                </Typography>

                <Box
                  sx={{
                    p: 1.8,
                    px: 2.2,
                    maxWidth: "85%",
                    borderRadius: 3,
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    ...(msg.sender === "user"
                      ? {
                          bgcolor: "#ffffff",
                          color: "#05070e",
                          fontWeight: 600,
                          boxShadow: "0 0 20px rgba(255,255,255,0.4)",
                          borderBottomRightRadius: 4,
                        }
                      : {
                          bgcolor: "rgba(255, 255, 255, 0.04)",
                          color: "#ffffff",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          fontFamily: "monospace",
                          borderBottomLeftRadius: 4,
                          boxShadow: "inset 0 0 15px rgba(255, 255, 255, 0.02)",
                        }),
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
                <Box sx={{ display: "flex", gap: "4px", alignItems: "center", height: 26 }}>
                  {[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 2.5,
                        bgcolor: "#ffffff",
                        boxShadow: "0 0 10px #ffffff",
                        animation: `${waveBar} 0.8s ${delay}s infinite ease-in-out`,
                      }}
                    />
                  ))}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    letterSpacing: 2,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  PROCESSING FREQUENCY...
                </Typography>
              </Box>
            )}

            <div ref={feedRef} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSend}
            sx={{
              p: 2,
              px: 2.5,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              bgcolor: "rgba(3, 7, 18, 0.9)",
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "30px",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                p: 0.6,
                pl: 2,
                transition: "all 0.3s ease",
                "&:focus-within": {
                  borderColor: "#ffffff",
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.35)",
                },
              }}
            >
              <InputBase
                fullWidth
                autoFocus
                disabled={loading}
                placeholder="Direct command enter karein..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                sx={{
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                  "& input::placeholder": {
                    color: "rgba(255, 255, 255, 0.35)",
                    opacity: 1,
                  },
                }}
              />

              <IconButton
                type="submit"
                disabled={loading || !input.trim()}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#05070e",
                  width: 34,
                  height: 34,
                  boxShadow: "0 0 12px rgba(255,255,255,0.6)",
                  "&:hover": { bgcolor: "#ffffff", transform: "scale(1.08)" },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.25)",
                  },
                }}
              >
                <ArrowUpwardRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default AIAssistantDrawer;