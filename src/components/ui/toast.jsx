import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(function ToastViewport(
  { className, ...props },
  ref,
) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        className,
      )}
      {...props}
    />
  )
})

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-white text-slate-950',
        destructive: 'destructive group border-red-500 bg-red-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Toast = React.forwardRef(function Toast(
  { className, variant, ...props },
  ref,
) {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})

const ToastAction = React.forwardRef(function ToastAction(
  { className, ...props },
  ref,
) {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-300 group-[.destructive]:hover:bg-red-500 group-[.destructive]:focus:ring-red-300',
        className,
      )}
      {...props}
    />
  )
})

const ToastClose = React.forwardRef(function ToastClose(
  { className, ...props },
  ref,
) {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        'absolute right-2 top-2 rounded-md p-1 text-slate-500 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-100 group-[.destructive]:hover:text-white',
        className,
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
})

const ToastTitle = React.forwardRef(function ToastTitle(
  { className, ...props },
  ref,
) {
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn('text-sm font-semibold', className)}
      {...props}
    />
  )
})

const ToastDescription = React.forwardRef(function ToastDescription(
  { className, ...props },
  ref,
) {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  )
})

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
