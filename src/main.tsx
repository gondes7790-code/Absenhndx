import { createRoot } from 'react-dom/client';
import './index.css';
import { AppErrorBoundary } from './components/AppErrorBoundary';

const root = createRoot(document.getElementById('root')!);

// Tautan wali murid (?p=<token>) dirender terpisah dari aplikasi guru:
// tanpa AuthProvider, tanpa App, tanpa localStorage, dan hanya memuat
// kode halaman publik (bundle jauh lebih kecil di ponsel wali murid).
const shareToken = new URLSearchParams(window.location.search).get('p');

if (shareToken) {
  import('./components/PublicSharePage').then(({ PublicSharePage }) => {
    root.render(
      <AppErrorBoundary>
        <PublicSharePage token={shareToken} />
      </AppErrorBoundary>
    );
  });
} else {
  Promise.all([
    import('./App.tsx'),
    import('./contexts/AuthContext'),
    import('./contexts/QueryProvider'),
    import('./contexts/ToastContext'),
  ]).then(
    ([{ default: App }, { AuthProvider }, { QueryProvider }, { ToastProvider }]) => {
      root.render(
        <AppErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </AppErrorBoundary>
      );
    }
  );
}
