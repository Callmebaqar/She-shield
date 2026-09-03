import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-brand-950 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-500 dark:text-brand-300 mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700">
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
