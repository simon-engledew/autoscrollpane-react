import React from 'react';
import { BoxSizingProperty, OverflowAnchorProperty, OverflowYProperty, ScrollBehaviorProperty } from 'csstype';

function tween(t: number, b: number, c: number, d: number) {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t * t + b;
  }
  t -= 2;
  return (c / 2) * (t * t * t + 2) + b;
}

export default class AutoScrollPane extends React.PureComponent<{threshold: number}> {
  private static readonly style = {
    padding: 0,
    margin: 0,
    boxSizing: 'border-box' as BoxSizingProperty,
    height: '100%' ,
    overflowY: 'scroll' as OverflowYProperty,
    scrollBehaviour: 'none' as ScrollBehaviorProperty,
    overflowAnchor: 'none' as OverflowAnchorProperty,
  };

  static defaultProps = {
    threshold: 150
  };

  private observer?: MutationObserver;
  private element?: HTMLDivElement;
  private timeout?: number;

  private animationFrame?: number;
  private start?: number;
  private target?: number;
  private then?: number;

  private previousScrollHeight = 0;
  private previousScrollTop = 0;
  private paused = false;

  private setElement = (element: HTMLDivElement) => {
    this.element = element;
  };

  scrollToBottom = (): void => {
    if (!this.element) {
      return;
    }
    if (!this.animationFrame) {
      this.then = Date.now();
      this.start = this.element.scrollTop;
      this.animationFrame = window.requestAnimationFrame(this.animate);
    }
    this.target = this.element.scrollHeight - this.element.clientHeight;
    this.timeout = undefined;
  };

  private animate = () => {
    if (this.animationFrame) {
      const span = Date.now() - this.then!;
      const position = this.element!.scrollTop;
      // keep animating if the target has changed
      if (Math.ceil(position) < this.target!) {
        this.element!.scrollTop = Math.min(
          tween(span, this.start!, this.target! - this.start!, 500),
          this.target!
        );
        this.animationFrame = window.requestAnimationFrame(this.animate);
      } else {
        this.previousScrollTop = position;
        this.animationFrame = undefined;
      }
    }
  };

  private observe = () => {
    if (this.paused) {
      return;
    }

    const {scrollTop, scrollHeight, clientHeight} = this.element!;

    const heightChanged = scrollHeight !== this.previousScrollHeight;

    // check if user has manually changed scroll position
    if (!this.animationFrame && scrollTop !== this.previousScrollTop) {
      const bottom = scrollTop + clientHeight;

      this.paused = bottom < scrollHeight;
    }

    if (heightChanged) {
      if (this.timeout) {
        window.clearTimeout(this.timeout);
      }

      this.previousScrollHeight = scrollHeight;
      this.previousScrollTop = scrollTop;

      if (!this.paused) {
        // simple 20ms debounce
        this.timeout = window.setTimeout(this.scrollToBottom, 20);
      }
    }
  };

  private unpause = () => {
    if (this.paused) {
      const {scrollTop, scrollHeight, clientHeight} = this.element!;

      const bottom = scrollTop + clientHeight;

      this.paused = bottom < scrollHeight;

      this.previousScrollTop = scrollTop;
    }
  }

  componentDidMount() {
    this.observer = new MutationObserver(this.observe);
    this.observer.observe(this.element!, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    this.element!.addEventListener('scroll', this.unpause, {
      capture: true,
      passive: true
    });
  }

  componentWillUnmount() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    this.element!.removeEventListener('scroll', this.unpause);
  }

  render() {
    return (
      <div ref={this.setElement} style={AutoScrollPane.style}>
        {this.props.children}
      </div>
    );
  }
}
