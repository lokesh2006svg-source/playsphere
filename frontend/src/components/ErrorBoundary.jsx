import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-court-950 flex flex-col items-center justify-center p-6 text-center text-[#F5F0E6]">
          <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-4 shadow-xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-[#F5F0E6]">Something unexpected happened</h2>
          <p className="text-[#9B9691] text-sm max-w-md mb-4">
            The page encountered an error. You can refresh or return to the main dashboard.
          </p>
          {this.state.error && (
            <div className="max-w-xl w-full text-left bg-court-900 border border-red-500/40 rounded-2xl p-4 mb-6 font-mono text-xs text-red-300 overflow-x-auto">
              <p className="font-bold text-red-400 mb-1">{this.state.error.toString()}</p>
              <pre className="text-[11px] text-[#9B9691] whitespace-pre-wrap">{this.state.error.stack}</pre>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl shadow-lg shadow-gold/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-court-850 hover:bg-court-800 text-[#F5F0E6] font-bold rounded-xl border border-court-700 hover:border-gold/40 transition-all text-xs"
            >
              Clear Storage & Reset
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
