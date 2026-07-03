"use client"

import { useTheme } from "next-themes"
import {
  RiCheckboxCircleLine,
  RiInformationLine,
  RiCloseLine,
  RiCloseCircleLine,
} from "@remixicon/react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type ToastKind = "success" | "error" | "info"

type ToastItem = {
  id: number
  message: string
  kind: ToastKind
  createdAt: number
  duration: number
}

type ToastEmitter = (items: ToastItem[]) => void

const toastQueue: ToastItem[] = []
const toastListeners = new Set<ToastEmitter>()
let nextToastId = 1

function emitToasts() {
  const snapshot = [...toastQueue]
  toastListeners.forEach((listener) => listener(snapshot))
}

function removeToast(toastId: number) {
  const index = toastQueue.findIndex((item) => item.id === toastId)
  if (index === -1) {
    return
  }

  toastQueue.splice(index, 1)
  emitToasts()
}

function pushToast(message: string, kind: ToastKind, duration = 3000) {
  const id = nextToastId++
  const item: ToastItem = { id, message, kind, createdAt: Date.now(), duration }

  toastQueue.push(item)
  emitToasts()

  window.setTimeout(() => {
    removeToast(id)
  }, duration)

  return id
}

export const toast = {
  success(message: string, options?: { duration?: number }) {
    return pushToast(message, "success", options?.duration)
  },
  error(message: string, options?: { duration?: number }) {
    return pushToast(message, "error", options?.duration)
  },
  info(message: string, options?: { duration?: number }) {
    return pushToast(message, "info", options?.duration)
  },
  dismiss(id?: number) {
    if (id === undefined) {
      toastQueue.splice(0, toastQueue.length)
      emitToasts()
      return
    }

    removeToast(id)
  },
}

type ToasterProps = {
  position?: "top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-center"
  closeButton?: boolean
  className?: string
}

function getPositionClass(position: string) {
  if (position === "top-left") {
    return "top-4 left-4 items-start"
  }
  if (position === "top-center") {
    return "top-4 left-1/2 -translate-x-1/2 items-center"
  }
  if (position === "bottom-right") {
    return "right-4 bottom-4 flex-col-reverse items-end"
  }
  if (position === "bottom-center") {
    return "bottom-4 left-1/2 -translate-x-1/2 items-center"
  }

  return "top-4 right-4 items-end"
}

const toastTone = {
  success: {
    panel: "border-emerald-300/40 bg-emerald-500/10 text-emerald-700",
    icon: "text-emerald-600",
  },
  error: {
    panel: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: "text-destructive",
  },
  info: {
    panel: "border-muted-foreground/35 bg-muted/35 text-muted-foreground",
    icon: "text-muted-foreground",
  },
} satisfies Record<ToastKind, { panel: string; icon: string }>

export function Toaster({ position = "top-right", closeButton = true, className }: ToasterProps) {
  const { theme } = useTheme()
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const onChange = (nextItems: ToastItem[]) => {
      setItems(nextItems)
    }

    toastListeners.add(onChange)
    onChange([...toastQueue])
    return () => {
      toastListeners.delete(onChange)
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  const resolvedTheme = theme === "dark" ? "dark" : "light"

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50 flex max-h-screen w-80 flex-col gap-2 overflow-auto px-4 sm:w-96",
        getPositionClass(position)
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "bg-background pointer-events-auto flex items-start gap-2 rounded-lg border p-3 text-xs shadow-lg backdrop-blur",
            toastTone[item.kind].panel,
            resolvedTheme === "dark" ? "text-foreground" : "",
            className
          )}
        >
          {item.kind === "success" ? (
            <RiCheckboxCircleLine
              className={cn("mt-0.5 size-4 shrink-0", toastTone[item.kind].icon)}
            />
          ) : item.kind === "error" ? (
            <RiCloseCircleLine
              className={cn("mt-0.5 size-4 shrink-0", toastTone[item.kind].icon)}
            />
          ) : (
            <RiInformationLine
              className={cn("mt-0.5 size-4 shrink-0", toastTone[item.kind].icon)}
            />
          )}
          <div className="min-w-0 flex-1 break-words">{item.message}</div>
          {closeButton ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground inline-flex transition"
              onClick={() => toast.dismiss(item.id)}
              aria-label="关闭"
            >
              <RiCloseLine className="size-4" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
