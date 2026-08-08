import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      richColors
      style={
        {
          "--normal-bg": "rgba(22,33,62,0.95)",
          "--normal-border": "rgba(124,58,237,0.35)",
          "--normal-text": "#f1f5f9",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
