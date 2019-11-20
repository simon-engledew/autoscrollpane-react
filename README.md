# autoscrollpane-react

Example: https://codesandbox.io/s/black-microservice-bgd7y

This autoscrollpane will smooth scroll down, pausing if the user scrolls up.

Scrolling is triggered by DOM mutations and supports elements that change size asynchronously like images or lazy-loaded content.

## Why?!

You can achieve the same effect using pure CSS/flexbox in Chrome but at the time of writing it doesn't work in Firefox due to a long-standing [rendering bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1042151).

Using `scrollToBottom` also has trouble if the content is frequently updating. Short of using it inside a `setInterval`, it is going to occassionally scroll short of the bottom.

This makes absolutely sure the element reliably scrolls down, regardless of what is happening inside.

## Tradeoffs

This is a pretty heavy-weight solution and it almost certainly wont work in older IE.

There are far better general-purpose solutions out there like [thk2b/autoscroll-react](https://github.com/thk2b/autoscroll-react).

The only reason you would use this is if you really, really need the content to stay scrolled down and the general purpose solutions are not working out.
