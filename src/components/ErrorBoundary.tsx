
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-2">Oops!</h2>
              <p className="text-xl text-gray-700 mb-6">Something went wrong</p>
              <div className="bg-red-50 p-4 rounded-md mb-6 text-left">
                <p className="text-sm font-medium text-red-800 mb-2">Error details:</p>
                <p className="text-sm text-red-700 break-words">
                  {this.state.error?.message || "Unknown error occurred"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
