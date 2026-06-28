"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { 
  CloudUpload, FileText, CheckCircle2, RefreshCw, 
  Search, ShieldAlert, Cpu, Database, Play, Check 
} from "lucide-react";

export default function KnowledgeCenter() {
  const { uploadedFiles, uploadDocument } = useAppState();
  
  // RAG query state
  const [query, setQuery] = useState("");
  const [querying, setQuerying] = useState(false);
  const [ragResult, setRagResult] = useState<{
    answer: string;
    sources: string[];
    chunksMatched: { file: string; text: string; score: number }[];
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    uploadDocument(files[0].name, files[0].size, files[0].type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    uploadDocument(files[0].name, files[0].size, files[0].type);
  };

  const handleRagQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setQuerying(true);
    setRagResult(null);

    // Simulate RAG vector database matching latency
    setTimeout(() => {
      setQuerying(false);
      setRagResult({
        answer: `XYZ.AI found matching contexts in your uploaded collateral. Standard enterprise pricing is structured in two tiers: Starter (₹999/mo) and Pro AI (₹2,999/mo). Product security enforces end-to-end client-side encryption and runs on isolated pgvector table partitions in Supabase.`,
        sources: uploadedFiles.map(f => f.name).slice(0, 2).concat(["Company Sitemap Catalog"]),
        chunksMatched: [
          {
            file: uploadedFiles[0]?.name || "pricing_sheet.pdf",
            text: "...Starter tier includes 1 workspace and up to 2 users for ₹999 monthly. Pro AI tier is ₹2,999 monthly and supports role assignment and unlimited outbound...",
            score: 0.94
          },
          {
            file: "site_index_crawled_metadata",
            text: "...XYZ.AI Revenue Platform operates sandbox database partitioning ensuring tenant-specific workspaces. Under no circumstance is data shared with OpenAI/Anthropic model weights...",
            score: 0.88
          }
        ]
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">AI Knowledge Base & RAG Ingestion</h1>
        <p className="text-[11px] text-gray-400">
          Upload company files to build private vector models. The AI reads files, generates embeddings, and answers queries contextually.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Uploader & Catalog */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Uploader Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="rounded-2xl border-2 border-dashed border-white/10 bg-dark-bg/20 p-8 text-center hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <CloudUpload className="h-10 w-10 text-gray-500" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Drag and drop company files here</p>
              <p className="text-xs text-gray-400">Supported formats: PDF, DOCX, PPTX, XLSX, TXT (Max 10MB)</p>
            </div>
            
            <label className="inline-flex h-8 items-center justify-center rounded bg-white/5 border border-white/10 px-4 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer transition-colors">
              Browse Files
              <input
                type="file"
                aria-label="Upload document"
                accept=".pdf,.docx,.pptx,.xlsx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Catalog */}
          <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Indexed Documents</h3>
              <span className="text-[10px] text-gray-500 font-mono">{uploadedFiles.length} files parsed</span>
            </div>

            <div className="divide-y divide-white/5">
              {uploadedFiles.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No company files uploaded. Drag a TXT or PDF above to start vector ingestion.
                </div>
              ) : (
                uploadedFiles.map((file) => (
                  <div key={file.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate max-w-[240px]" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {file.size} • Uploaded {file.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[8px] text-gray-500 uppercase tracking-wider block">status</span>
                        <span className={`text-[10px] font-bold uppercase ${
                          file.status === "embedded" ? "text-secondary" : "text-primary"
                        }`}>
                          {file.status}
                        </span>
                      </div>
                      {file.chunks > 0 && (
                        <div className="text-right">
                          <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Chunks</span>
                          <span className="text-xs font-mono text-gray-300">{file.chunks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right: RAG Sandbox Query Testing */}
        <div className="rounded-xl border border-white/5 bg-dark-bg/40 glass-panel p-5 space-y-6">
          <div className="space-y-1.5 border-b border-white/5 pb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4.5 w-4.5 text-primary" /> RAG Semantic Sandbox
            </h3>
            <p className="text-[10px] text-gray-400">
              Query your indexed vector base directly to verify how the AI retrieves knowledge.
            </p>
          </div>

          <form onSubmit={handleRagQuery} className="space-y-4">
            <div className="relative flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
              <Search className="h-4 w-4 text-gray-500 ml-2" />
              <input
                type="text"
                placeholder="Ask about pricing, plans..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-0 text-xs text-white placeholder-gray-600 focus:outline-none px-2 py-1.5"
              />
              <button
                type="submit"
                disabled={querying || uploadedFiles.length === 0}
                className="rounded bg-primary px-3 py-1.5 text-[10px] font-bold text-white hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {querying ? "Searching..." : "Query"}
              </button>
            </div>
            {uploadedFiles.length === 0 && (
              <p className="text-[9px] text-red-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Upload at least one file first to unlock sandbox queries.
              </p>
            )}
          </form>

          {/* RAG response */}
          {ragResult && (
            <div className="space-y-4">
              {/* Answer */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">AI Generated Response</span>
                <div className="rounded border border-secondary/20 bg-secondary/5 p-3.5 text-xs text-gray-200 leading-relaxed font-sans font-medium">
                  {ragResult.answer}
                </div>
              </div>

              {/* Chunks Matched */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Vector Matches (pgvector index search)</span>
                <div className="space-y-2 font-mono text-[9px] text-gray-500">
                  {ragResult.chunksMatched.map((chunk, idx) => (
                    <div key={idx} className="border border-white/5 bg-black/40 rounded p-2.5 space-y-1">
                      <div className="flex justify-between font-sans">
                        <span className="text-primary truncate max-w-[150px]">{chunk.file}</span>
                        <span className="text-secondary font-bold">score: {chunk.score}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 leading-relaxed font-mono">
                        "{chunk.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider shrink-0 mt-1">sources:</span>
                {ragResult.sources.map((src, idx) => (
                  <span key={idx} className="rounded bg-white/5 px-2 py-0.5 text-[8px] text-gray-400 border border-white/5 truncate max-w-[100px]" title={src}>
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
