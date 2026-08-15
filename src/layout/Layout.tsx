import { cn } from '@/lib/utils';
import React from 'react'

const Layout = ({ children, className, id }: { children: React.ReactNode | React.ReactNode[] | null; className?: string; id?: string }) => {
  return (
    <div id={id} className={cn("p-2 h-dvh", className)}>
      {children}
    </div>
  )
}

export default Layout