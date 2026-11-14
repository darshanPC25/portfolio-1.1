import { Component, type ReactNode } from 'react'

interface SceneBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

/** Shows the fallback if the 3D scene throws (lost context, unsupported GPU). */
export class SceneBoundary extends Component<SceneBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
