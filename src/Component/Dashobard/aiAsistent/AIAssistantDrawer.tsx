import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Drawer,
  IconButton,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  keyframes,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { sendAiCommandAction } from "../../../Actions/Auth/ai"; // Apne path ke hisaab se adjust karein

interface Message {
  sender: "user" | "ai";
  text: string;
}

// ⭐ 3D Glowing & Pulsing Animation
const pulseGlow = keyframes`
  0% { 
    box-shadow: 0 0 10px #00e5ff, 0 0 20px #00e5ff inset; 
    transform: scale(1) translateY(0); 
  }
  50% { 
    box-shadow: 0 0 25px #d500f9, 0 0 35px #d500f9 inset; 
    transform: scale(1.1) translateY(-3px); 
  }
  100% { 
    box-shadow: 0 0 10px #00e5ff, 0 0 20px #00e5ff inset; 
    transform: scale(1) translateY(0); 
  }
`;

const AIAssistantDrawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! Main aapka Bricks AI Assistant hoon. Mujhe command dijiye (eg. 'Asif naam ka user banao').",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userCommand = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userCommand }]);
    setLoading(true);

    try {
      // ⭐ Calling Redux Action
      const res = await dispatch(sendAiCommandAction(userCommand));
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res?.msg || "✅ Command executed successfully!" },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: err?.msg || "❌ Failed to execute command. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= 3D GLOWING BUTTON (LEFT SIDE) ================= */}
      <Box
        onClick={() => setIsOpen(true)}
        sx={{
          position: "fixed",
          bottom: 40,
          right: 30, // Left side placement
          zIndex: 1200,
          background: "linear-gradient(135deg, #00e5ff 0%, #d500f9 100%)",
          color: "white",
          p: 2,
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: `${pulseGlow} 2s infinite ease-in-out`,
          border: "2px solid rgba(255,255,255,0.3)",
          "&:hover": {
            animation: "none",
            transform: "scale(1.15)",
            boxShadow: "0 0 30px #d500f9",
          },
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 32, animation: "spin 5s linear infinite" }} />
      </Box>

      {/* ================= AI DRAWER (RIGHT SLIDE) ================= */}
      <Drawer
        anchor="right" // Popup screen right side se open hogi
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            bgcolor: "#f4f7fa",
            borderRight: "4px solid #d500f9",
            boxShadow: "10px 0 30px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            p: 2.5,
            background: "linear-gradient(135deg, #101820 0%, #29323c 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #00e5ff",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "rgba(0, 229, 255, 0.2)", color: "#00e5ff" }}>
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                AI Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: "#00e5ff" }}>
                Powered by Gemini
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* CHAT BODY */}
        <Box
          sx={{
            p: 2,
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundImage: "radial-gradient(#e0e0e0 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
              gap={1}
            >
              {msg.sender === "ai" && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#101820", border: "1px solid #00e5ff" }}>
                  <SmartToyIcon sx={{ fontSize: 18, color: "#00e5ff" }} />
                </Avatar>
              )}
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  maxWidth: "80%",
                  borderRadius: 3,
                  borderTopLeftRadius: msg.sender === "ai" ? 4 : 12,
                  borderTopRightRadius: msg.sender === "user" ? 4 : 12,
                  background: msg.sender === "user" 
                    ? "linear-gradient(135deg, #1976d2, #42a5f5)" 
                    : "white",
                  color: msg.sender === "user" ? "white" : "#222",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  boxShadow: msg.sender === "user" ? "0 4px 10px rgba(25, 118, 210, 0.3)" : "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                {msg.text}
              </Paper>
              {msg.sender === "user" && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#1976d2" }}>
                  <PersonIcon sx={{ fontSize: 18 }} />
                </Avatar>
              )}
            </Box>
          ))}

          {loading && (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#101820" }}>
                <CircularProgress size={18} sx={{ color: "#00e5ff" }} />
              </Avatar>
              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: "italic" }}>
                Thinking and executing...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* INPUT AREA */}
        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            p: 2,
            bgcolor: "white",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            gap: 1.5,
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your command..."
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 8,
                bgcolor: "#f4f7fa",
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !input.trim()}
            sx={{ 
              minWidth: 50, 
              borderRadius: "50%", 
              height: 40, 
              width: 40, 
              p: 0,
              background: "linear-gradient(135deg, #00e5ff, #d500f9)",
              border: "none",
              color: "white"
            }}
          >
            <SendIcon sx={{ ml: 0.5, fontSize: 20 }} />
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistantDrawer;