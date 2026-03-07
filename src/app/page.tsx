"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Code, Cpu, RefreshCw, Send, ArrowRight } from "lucide-react";

type VibeReport = {
  uniquenessScore: number;
  pivot: string;
  weekendStack: string[];
};

const LoadingState = ({ phase }: { phase: number }) => {
  const phases = [
    { text: "Thinking... parsing shower thoughts", icon: <Cpu className="w-5 h-5 text-cyber-accent-cyan" /> },
    { text: "Searching... traversing the web for clones", icon: <Terminal className="w-5 h-5 text-cyber-accent-purple" /> },
    { text: "Judging... calculating harsh realities", icon: <Code className="w-5 h-5 text-cyber-accent-pink" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-2xl bg-cyber-bg-card border border-[#2a2a30] rounded-lg p-6 font-mono text-sm relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-accent-cyan to-cyber-accent-purple animate-pulse" />
      <div className="flex flex-col gap-4">
        {phases.map((p, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: index <= phase ? 1 : 0.3, x: 0 }}
            className={`flex items-center gap-3 ${index === phase ? "text-white" : "text-gray-500"}`}
          >
            {p.icon}
            <span>{p.text}</span>
            {index === phase && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-white block"
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ReportCard = ({ report, onReset }: { report: VibeReport; onReset: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl flex flex-col gap-6"
    >
      <div className="w-full bg-cyber-bg-card border border-gray-800 rounded-xl p-8 relative overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.05)]">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyber-accent-cyan opacity-50 rounded-tl-xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyber-accent-purple opacity-50 rounded-br-xl" />
        
        <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
          <Sparkles className="w-6 h-6 text-cyber-accent-cyan" />
          <h2 className="text-2xl font-mono font-bold text-white tracking-widest uppercase">The Vibe Report</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Score */}
          <div className="flex flex-col gap-2">
            <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider">Uniqueness Score</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-black ${report.uniquenessScore > 7 ? 'text-cyber-accent-cyan text-glow-cyan' : report.uniquenessScore > 4 ? 'text-yellow-400' : 'text-cyber-accent-pink'}`}>
                {report.uniquenessScore}
              </span>
              <span className="text-gray-500 text-xl font-mono">/ 10</span>
            </div>
          </div>

          {/* Pivot */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> The Pivot (10x Cooler)
            </h3>
            <p className="text-gray-200 leading-relaxed text-lg bg-[#1a1a20] p-4 rounded-lg border-l-2 border-cyber-accent-purple">
              {report.pivot}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-gray-400 font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Code className="w-4 h-4" /> The Weekend Stack
          </h3>
          <div className="flex flex-wrap gap-3">
            {report.weekendStack.map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-[#1a1a20] border border-gray-700 rounded-md text-sm font-mono text-gray-300 hover:border-cyber-accent-cyan transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <button
        onClick={onReset}
        className="self-center flex items-center gap-2 text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-gray-800/50"
      >
        <ArrowRight className="w-4 h-4 rotate-180" /> Validate Another Vibe
      </button>
    </motion.div>
  );
};

export default function Home() {
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [report, setReport] = useState<VibeReport | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [idea]);

  const handleSubmit = async () => {
    if (!idea.trim()) return;
    setStatus("loading");
    setLoadingPhase(0);

    // Mock the loading phases
    const phaseInterval = setInterval(() => {
      setLoadingPhase((p) => {
        if (p >= 2) {
          clearInterval(phaseInterval);
          return 2;
        }
        return p + 1;
      });
    }, 1500);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to validate vibe. Check console.");
      }
      
      // Keep it in judging state for a sec
      await new Promise(r => setTimeout(r, 1000));
      
      setReport(data);
      setStatus("done");
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message}`);
      setStatus("idle");
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col items-center justify-center -mt-20">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl flex flex-col gap-4 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-accent-cyan via-cyber-accent-purple to-cyber-accent-cyan rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-[#0a0a0c] rounded-xl border border-gray-800 focus-within:border-cyber-accent-cyan/50 transition-colors shadow-2xl overflow-hidden">
              <textarea
                ref={textareaRef}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Drop your messy shower thought here..."
                className="w-full min-h-[120px] bg-transparent text-white p-6 outline-none resize-none font-sans text-lg placeholder:text-gray-600 leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="w-full bg-[#141417] border-t border-gray-800 p-3 flex justify-between items-center">
                <span className="text-xs font-mono text-gray-500 pl-3">Press Enter to validate</span>
                <button
                  onClick={handleSubmit}
                  disabled={!idea.trim()}
                  className="bg-white text-black px-6 py-2 rounded-md font-bold font-mono text-sm hover:glow-cyan hover:bg-cyber-accent-cyan transition-all disabled:opacity-50 disabled:hover:glow-none flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> VIBE CHECK
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div key="loading" className="w-full flex justify-center">
             <LoadingState phase={loadingPhase} />
          </motion.div>
        )}

        {status === "done" && report && (
          <motion.div key="report" className="w-full flex justify-center">
            <ReportCard report={report} onReset={() => { setStatus("idle"); setIdea(""); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
