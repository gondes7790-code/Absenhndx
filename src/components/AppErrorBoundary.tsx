import React from 'react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Kesalahan tidak dikenal.',
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('[AppErrorBoundary] Render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen flex items-center justify-center bg-[#faf7ee] p-5">
        <section className="w-full max-w-md rounded-3xl border-2 border-slate-900 bg-white p-6 text-center shadow-[5px_5px_0px_#1e293b]">
          <h1 className="text-lg font-black text-slate-900">Aplikasi mengalami kendala</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            Halaman tidak dapat ditampilkan dengan benar. Muat ulang aplikasi untuk mencoba lagi.
          </p>
          {import.meta.env.DEV && this.state.message && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-slate-100 p-3 text-left text-xs text-rose-800">
              {this.state.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 rounded-2xl border-2 border-slate-900 bg-[#a7f3d0] px-4 py-2.5 text-sm font-black text-slate-950 shadow-[3px_3px_0px_#1e293b]"
          >
            Muat Ulang
          </button>
        </section>
      </main>
    );
  }
}
