import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ [AppErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-center backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-3xl mb-5 animate-pulse">
              <FaExclamationTriangle />
            </div>

            <h2 className="text-xl md:text-2xl font-black font-display text-white mb-2">
              पेज लोड करने में अस्थायी समस्या आई
            </h2>
            <p className="text-slate-300 text-xs md:text-sm mb-6 leading-relaxed">
              नेटवर्क कनेक्शन या डेटा लोड करते समय रुकावट आई है। नीचे दिए गए बटन पर क्लिक करके पेज को रीलोड करें।
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-red-500/20 rounded-xl p-3 mb-6 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-red-300">
                <p className="font-bold text-red-400 mb-1">त्रुटि विवरण (Error):</p>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all"
              >
                <FaRedo className="text-xs" /> फिर से लोड करें
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
              >
                <FaHome className="text-xs" /> होमपेज
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
