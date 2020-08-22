# XState - Simple Drag and Drop example
A simple implementation of drag-and-drop using [XState](https://xstate.js.org/). Based on [this video by Fun Fun Function](https://www.youtube.com/watch?v=uRfQJJArZEg) (R.I.P.). It adds some extra functionality, though: 
- Supports multiple draggable elements
- Re-orders the z-index attribute based on the last dragged element
- Nice animations for dragged elements

You can preview the final result on [this project's GitHub pages](https://ligabloo.github.io/xstate-drag-and-drop-example/).

## How it works
The basic idea is:
- Add event listeners on the `document` for `mousedown`, `mousemove` and `mouseup` events.
- Delegate `mousedown` events for target with an id and the `data-draggable` custom attributes to XState
- XState saves a reference to the target element, and creates an entry on the context value `draggables` if it doesn't have one.
- On `mouseMove`, we move set the element's `top` and `left` style attributes based on the current mouse position + the initial element position on `mousedown`
- On `mousedown`, we persist the dragged element's position on our `draggables` Map.


## Running the project

This project uses Parcel for bundling. Clone this repository, open the folder on terminal and run `npm start`. Parcel will give you a nice local server that will watch and reload for every change you make.

## Building

To build the project, run the `build` npm script using the command `npm run build`. The build will be found on the docs directory. Simple as that! ✨

## Contact the author

If you have any questions about the code, the project, life or anything else, you can contact-me via [e-mail](mailto:matheus.s.ligabue@gmail.com) or [twitter](https://twitter.com/ligabloo).