import React from 'react';
import {
  BoxSizingProperty,
  OverflowAnchorProperty,
  OverflowYProperty,
  ScrollBehaviorProperty,
} from 'csstype';

function tween(t: number, b: number, c: number, d: number) {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t * t + b;
  }
  t -= 2;
  return (c / 2) * (t * t * t + 2) + b;
}

const styles = {
  div: {
    padding: 0,
    margin: 0,
    boxSizing: 'border-box' as BoxSizingProperty,
    height: '100%',
    overflowY: 'scroll' as OverflowYProperty,
    scrollBehaviour: 'none' as ScrollBehaviorProperty,
    overflowAnchor: 'none' as OverflowAnchorProperty,
  },
};

export default function AutoScrollPane({
  children,
}: React.PropsWithChildren<{}>) {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(
    function() {
      if (divRef.current) {
        var animationFrame: number | undefined;
        var timeout: number | undefined;
        var scrollTimeStamp: number;
        var paused: boolean;
        var previousScrollHeight: number;
        var target: number;
        var then: number;
        var start: number;

        function animate() {
          if (animationFrame && divRef.current) {
            const span = Date.now() - then;
            const position = divRef.current.scrollTop;

            // keep animating if the target has changed
            if (Math.ceil(position) < target) {
              divRef.current.scrollTop = Math.min(
                tween(span, start, target - start, 500),
                target
              );
              animationFrame = window.requestAnimationFrame(animate);
            } else {
              animationFrame = undefined;
            }
          }
        }

        function scrollToBottom() {
          if (divRef.current) {
            if (!animationFrame) {
              then = Date.now();
              start = divRef.current.scrollTop;
              animationFrame = window.requestAnimationFrame(animate);
            }

            const { scrollHeight, clientHeight } = divRef.current;

            target = scrollHeight - clientHeight;
            timeout = undefined;
          }
        }

        function onMutate() {
          if (paused) {
            return;
          }

          if (divRef.current) {
            const { scrollHeight } = divRef.current;

            const heightChanged = scrollHeight !== previousScrollHeight;

            if (heightChanged) {
              timeout && window.clearTimeout(timeout);

              previousScrollHeight = scrollHeight;

              if (!paused) {
                // simple 20ms debounce
                timeout = window.setTimeout(scrollToBottom, 20);
              }
            }
          }
        }

        function onScroll(e: Event) {
          if (animationFrame === undefined && divRef.current) {
            if (scrollTimeStamp) {
              if (scrollTimeStamp > e.timeStamp - 50) {
                const {
                  scrollTop,
                  scrollHeight,
                  clientHeight,
                } = divRef.current;
                const bottom = scrollTop + clientHeight;
                paused = bottom < scrollHeight;
              }
            }
            scrollTimeStamp = e.timeStamp;
          }
        }

        const observer = new MutationObserver(onMutate);

        observer.observe(divRef.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });

        divRef.current.addEventListener('scroll', onScroll, {
          capture: true,
          passive: true,
        });

        return function() {
          observer.disconnect();

          animationFrame && window.cancelAnimationFrame(animationFrame);
          timeout && window.clearTimeout(timeout);
        };
      }
    },
    [divRef.current]
  );

  return (
    <div ref={divRef} style={styles.div}>
      {children}
    </div>
  );
}
