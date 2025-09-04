'use client'

import { PageGeneratorFullscreen } from './page-generator-fullscreen'

interface PageGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PageGeneratorDialog({ open, onOpenChange }: PageGeneratorDialogProps) {
  return <PageGeneratorFullscreen open={open} onOpenChange={onOpenChange} />
}
