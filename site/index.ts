import { interpret, createMachine, assign } from "xstate";

interface DragAndDropContext {
  id: string;
  draggables: Map<string, { x: number; y: number }>;
  order: Array<string>;
  px: number;
  py: number;
  dx: number;
  dy: number;
}

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
  MouseEvent,
  DragAndDropState
>(
  {
    initial: "idle",
    context: {
      id: null,
      draggables: new Map(),
      order: [],
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
            actions: ["onIdleToDragging"],
          },
        },
      },
      dragging: {
        entry: ["onDraggingStart"],
        on: {
          mousemove: {
            target: "dragging",
            actions: ["onDraggingUpdate"],
          },
          mouseup: {
            target: "idle",
            actions: ["onDraggingToIdle"],
          },
        },
      },
    },
  },
  {
    actions: {
      onIdleToDragging: assign(
        (context: DragAndDropContext, event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const x = parseFloat(
            getComputedStyle(target).getPropertyValue("left")
          );
          const y = parseFloat(
            getComputedStyle(target).getPropertyValue("top")
          );

          const draggable = context.draggables.get(target.id) || {
            x,
            y,
          };

          return {
            ...context,
            id: target.id,
            draggables: context.draggables.set(target.id, draggable),
            px: event.clientX,
            py: event.clientY,
          };
        }
      ),
      onDraggingStart: assign(
        (context: DragAndDropContext, event: MouseEvent) => {
          const target = document.getElementById(context.id) as HTMLElement;

          context.order = context.order
            .filter((id) => id !== target.id)
            .concat(target.id);

          const draggableElements = document.querySelectorAll(
            "[data-draggable]"
          );
          draggableElements.forEach((draggable: HTMLElement) => {
            const isOrdered = context.order.includes(draggable.id);
            draggable.style.zIndex = `${
              isOrdered ? context.order.indexOf(draggable.id) + 1 : 0
              }`;
          });
          return context;
        }
      ),
      onDraggingUpdate: assign(
        (context: DragAndDropContext, event: MouseEvent) => {
          return {
            ...context,
            dx: event.clientX - context.px,
            dy: event.clientY - context.py,
          };
        }
      ),
      onDraggingToIdle: assign((context: DragAndDropContext) => {
        const draggable = context.draggables.get(context.id);

        return {
          ...context,
          draggables: context.draggables.set(context.id, {
            x: context.dx + (draggable ? draggable.x : 0),
            y: context.dy + (draggable ? draggable.y : 0),
          }),
          dx: 0,
          dy: 0,
        };
      }),
    },
  }
);

const dragAndDropService = interpret(dragAndDropMachine)
  .onTransition((state, event) => {
    if (state.changed) {
      const target = document.getElementById(state.context.id);

      switch (state.value) {
        case "dragging": {
          const draggable = state.context.draggables.get(state.context.id);
          target.dataset.dragging = "true";
          target.style.setProperty(
            "left",
            `${draggable.x + state.context.dx}px`
          );
          target.style.setProperty(
            "top",
            `${draggable.y + state.context.dy}px`
          );
          break;
        }
        case "idle": {
          target.dataset.dragging = "false";
          break;
        }
      }
    }
  })
  .start();

document.addEventListener("mousedown", (event) => {
  const target = event.target as HTMLElement;
  const isDraggable = target.hasAttribute("data-draggable");
  const hasId = !!target.id;

  if (!isDraggable) return;
  if (!hasId) {
    console.log("Sorry, draggable elements need to have IDs!");
    return;
  }

  dragAndDropService.send(event);
});

document.addEventListener("mousemove", (event) => {
  dragAndDropService.send(event);
});

document.addEventListener("mouseup", (event) => {
  dragAndDropService.send(event);
});
