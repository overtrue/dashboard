"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"
import { RiLoaderLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { getDryRunConfirmVariant } from "@/lib/operations/dry-run"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message
    if (typeof message === "string" && message.trim()) return message
  }
  return "Preparation or execution failed"
}

type DryRunActionButtonProps<TPayload, TPlan> = {
  payload: TPayload
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children: ReactNode
  className?: string
  buttonClassName?: string
  isConfirmDisabled?: (plan: TPlan) => boolean
  onPrepare: (payload: TPayload) => Promise<TPlan>
  onExecute: (payload: TPayload, plan: TPlan) => Promise<unknown>
  renderPlan: (plan: TPlan) => ReactNode
  onSuccess?: () => void
  onError?: (message: string) => void
  modalTitle?: string
  modalDescription?: string
  confirmLabel?: string
}

export function DryRunActionButton<TPayload, TPlan>({
  payload,
  disabled,
  variant = "destructive",
  size = "default",
  children,
  onPrepare,
  onExecute,
  isConfirmDisabled,
  className,
  buttonClassName,
  renderPlan,
  onSuccess,
  onError,
  modalTitle = "Confirm dry-run results",
  modalDescription = "Please review the preview below before executing.",
  confirmLabel = "Confirm & Execute",
}: DryRunActionButtonProps<TPayload, TPlan>) {
  const [plan, setPlan] = useState<TPlan | null>(null)
  const [isPreparing, setIsPreparing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const payloadRef = useRef<TPayload | null>(null)

  const handlePrepare = useCallback(async () => {
    setError(null)
    setPlan(null)
    setIsPreparing(true)
    payloadRef.current = payload

    try {
      const nextPlan = await onPrepare(payload)
      setPlan(nextPlan)
      setOpen(true)
    } catch (prepareError) {
      const message = getErrorMessage(prepareError)
      setError(message)
      onError?.(message)
    } finally {
      setIsPreparing(false)
    }
  }, [onError, onPrepare, payload])

  const handleExecute = useCallback(async () => {
    if (!payloadRef.current || !plan) return
    setError(null)
    setIsExecuting(true)
    try {
      await onExecute(payloadRef.current, plan)
      setOpen(false)
      onSuccess?.()
    } catch (executeError) {
      const message = getErrorMessage(executeError)
      setError(message)
      onError?.(message)
    } finally {
      setIsExecuting(false)
    }
  }, [onExecute, onSuccess, onError, plan])

  const isBusy = isPreparing || isExecuting
  const isPlanReadyForConfirm = !isBusy && plan !== null && !isConfirmDisabled?.(plan)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        variant={variant}
        size={size}
        onClick={handlePrepare}
        disabled={disabled || isBusy}
        className={buttonClassName}
      >
        {isPreparing ? <RiLoaderLine aria-hidden className="size-4 animate-spin" /> : children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[42rem]">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">{plan ? renderPlan(plan) : null}</div>
          {error ? (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded border p-2 text-xs"
            >
              {error}
            </p>
          ) : null}
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={getDryRunConfirmVariant(variant)}
              onClick={handleExecute}
              disabled={!isPlanReadyForConfirm}
            >
              {isExecuting ? (
                <RiLoaderLine aria-hidden className="size-4 animate-spin" />
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error ? (
        <p className="text-destructive text-xs" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  )
}
