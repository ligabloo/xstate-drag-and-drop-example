import { createMachine, interpret, assign } from "xstate";

interface DragAndDropContext {
  target: EventTarget | null;
  x: number;
  y: number;
  px: number;
  py: number;
  dx: number;
  dy: number;
}

type DragAndDropEvent = MouseEvent;

type DragAndDropState =
  | {
      value: "idle";
      context: DragAndDropContext & {
        target: null;
      };
    }
  | {
      value: "dragging";
      context: DragAndDropContext & {
        target: EventTarget | null;
      };
    };

const dragAndDropMachine = createMachine<
  DragAndDropContext,
  DragAndDropEvent,
  DragAndDropState
>({
  initial: "idle",
  context: {
    target: null,
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    dx: 0,
    dy: 0,
  },
  states: {
    idle: {
      on: {
        mousedown: {
          target: "dragging",
          actions: assign((context, event) => {
            const target = event.target as HTMLElement;
            return {
              ...context,
              target,
              px: event.clientX,
              py: event.clientY,
            };
          }),
        },
      },
    },
    dragging: {
      on: {
        mouseup: {
          target: "idle",
          actions: assign((context, event) => {
            return {
              ...context,
              x: context.x + context.dx,
              y: context.y + context.dy,
            };
          }),
        },
        mousemove: {
          target: "dragging",
          actions: assign((context, event) => {
            return {
              ...context,
              dx: event.clientX - context.px,
              dy: event.clientY - context.py,
            };
          }),
        },
      },
    },
  },
});

const dragAndDropService = interpret(dragAndDropMachine)
  .onTransition((state) => {
    if (state.changed) {
      switch (state.value) {
        case "dragging": {
          const draggable = state.context.target as HTMLElement;
          if (!draggable) return;
          draggable.style.setProperty("left", `${state.context.dx}px`);
          draggable.style.setProperty("top", `${state.context.dy}px`);
        }
      }
    }
  })
  .start();

document.addEventListener("mousedown", (event) => {
  const target = event.target as HTMLElement;
  if (!target.hasAttribute("data-draggable")) return;
  dragAndDropService.send(event);
});

document.addEventListener("mousemove", (event) => {
  dragAndDropService.send(event);
});

document.addEventListener("mouseup", (event) => {
  dragAndDropService.send(event);
});
