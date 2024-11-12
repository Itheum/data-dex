import React from "react";

interface PropsType {
  children: any;
}

export default class ErrorBoundary extends React.Component<PropsType> {
  state = { hasError: false };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h2>Something went wrong, the error has been reported.</h2>;
    }

    return this.props.children;
  }
}

// throw new Error('I crashed!'); ca be used where you can to invoke th error boundary
