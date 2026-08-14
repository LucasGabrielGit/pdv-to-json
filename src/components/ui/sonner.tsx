"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400" />
        ),
        info: (
          <InfoIcon className="size-4 text-cyan-400" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-purple-400" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#16213e] group-[.toaster]:text-slate-100 group-[.toaster]:border group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl font-sans",
          description: "group-[.toast]:text-slate-400 text-xs",
          actionButton:
            "group-[.toast]:bg-purple-600 group-[.toast]:text-white font-medium text-xs",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-slate-300 font-medium text-xs",
          success:
            "group-[.toaster]:border-emerald-500/50 group-[.toaster]:bg-[#16213e] group-[.toaster]:text-emerald-300",
          error:
            "group-[.toaster]:border-rose-500/50 group-[.toaster]:bg-[#16213e] group-[.toaster]:text-rose-300",
          info:
            "group-[.toaster]:border-cyan-500/50 group-[.toaster]:bg-[#16213e] group-[.toaster]:text-cyan-300",
          warning:
            "group-[.toaster]:border-amber-500/50 group-[.toaster]:bg-[#16213e] group-[.toaster]:text-amber-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
