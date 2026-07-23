import { Component, ErrorInfo, ReactNode } from 'react';
import { Typography } from './Typography';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-6 bg-background text-center">
          <div className="max-w-md space-y-4 p-8 rounded-2xl bg-surface border border-border shadow-sm">
            <div className="text-4xl">⚠️</div>
            <Typography variant="h2">Something went wrong</Typography>
            <Typography variant="body" className="text-text-muted">
              An unexpected error occurred. Your local data remains safe.
            </Typography>
            <Button onClick={this.handleReload} variant="primary" className="mt-4">
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
