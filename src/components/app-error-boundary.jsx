import { Component } from "react";
import ErrorPage from "@/pages/error-page";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep console signal for debugging while showing fallback UI to users.
    // eslint-disable-next-line no-console
    console.error("LifeOS render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return this.props.children;
  }
}
