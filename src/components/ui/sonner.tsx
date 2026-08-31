"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

// `useTheme` from next-themes was removed — the app uses a fixed light theme.
// If dark-mode support is added later, re-add ThemeProvider and useTheme here.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
