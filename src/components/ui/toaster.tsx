"use client";

import { useSyncExternalStore } from "react";
import { Toast } from "radix-ui";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import {
  dismissToast,
  getToasts,
  runToastAction,
  subscribeToasts,
  type ToastItem,
} from "@/lib/toast/store";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { IconButton } from "./icon-button";

const NO_TOASTS: readonly ToastItem[] = [];

/** Mount once in the root layout. Show toasts with `toast()` or `undoable()` from "@/lib/toast/store". */
export function Toaster() {
  const toasts = useSyncExternalStore(
    subscribeToasts,
    getToasts,
    () => NO_TOASTS,
  );

  return (
    <Toast.Provider label="Notifications" swipeDirection="right">
      {toasts.map((item) => (
        <ToastView key={item.id} item={item} />
      ))}
      <Toast.Viewport className="fixed right-0 bottom-0 z-[70] m-0 flex w-full max-w-[440px] list-none flex-col gap-2 p-4 outline-none max-md:pb-[calc(76px+env(safe-area-inset-bottom))]" />
    </Toast.Provider>
  );
}

function ToastView({ item }: { item: ToastItem }) {
  const Icon =
    item.tone === "success"
      ? CircleCheck
      : item.tone === "error"
        ? CircleAlert
        : null;

  return (
    <Toast.Root
      duration={item.duration}
      onOpenChange={(open) => {
        // Wait for the exit animation, then forget the toast.
        if (!open) window.setTimeout(() => dismissToast(item.id), 200);
      }}
      className="flex items-start gap-3 rounded-card border border-border bg-card-elevated p-4 [box-shadow:var(--edge-highlight),var(--elevation-soft)] data-[state=closed]:animate-toast-out data-[state=open]:animate-toast-in data-[swipe=end]:animate-toast-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
    >
      {Icon ? (
        <Icon
          aria-hidden
          className={cn(
            "mt-0.5 size-5 shrink-0",
            item.tone === "success" ? "text-success" : "text-error",
          )}
        />
      ) : null}
      <div className="grid min-w-0 flex-1 gap-0.5">
        <Toast.Title className="text-body font-medium">
          {item.title}
        </Toast.Title>
        {item.description ? (
          <Toast.Description className="text-secondary text-text-2">
            {item.description}
          </Toast.Description>
        ) : null}
      </div>
      {item.action ? (
        <Toast.Action asChild altText={`${item.action.label}: ${item.title}`}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => runToastAction(item.id)}
          >
            {item.action.label}
          </Button>
        </Toast.Action>
      ) : null}
      <Toast.Close asChild>
        <IconButton label="Dismiss" icon={X} className="-mt-2 -mr-2 size-9" />
      </Toast.Close>
    </Toast.Root>
  );
}
