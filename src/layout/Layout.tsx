import { cn } from '@/lib/utils';
import React from 'react'

const Layout = ({ children, className }: { children: React.ReactNode | React.ReactNode[] | null; className?: string }) => {
  return (
    <div className={cn("p-2 h-dvh", className)}>
      {children}
    </div>
  )
}

export default Layout