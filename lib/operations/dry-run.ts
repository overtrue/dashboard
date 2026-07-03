type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

export function getDryRunConfirmVariant(variant: ButtonVariant): "default" | "destructive" {
  return variant === "destructive" ? "destructive" : "default"
}
