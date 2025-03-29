import * as React from 'react'

import { cn } from 'tools/style'

export interface SpinnerProps
  extends React.InputHTMLAttributes<HTMLDivElement> {
  type?: 'short' | 'long' | 'bars';
}

const spinners = {
  long: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 16 16'>
      <path
        fill='currentColor'
        d='M2.501 8a5.5 5.5 0 1 1 5.5 5.5A.75.75 0 0 0 8 15a7 7 0 1 0-7-7a.75.75 0 0 0 1.501 0'
      />
    </svg>
  ),
  short: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={24}
      height={24}
      viewBox='0 0 24 24'
    >
      <path
        fill='currentColor'
        d='M2 12C2 6.477 6.477 2 12 2v3a7 7 0 0 0-7 7z'
      />
    </svg>
  ),
  bars: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 256 256'>
      <path
        fill='currentColor'
        d='M136 32v32a8 8 0 0 1-16 0V32a8 8 0 0 1 16 0m37.25 58.75a8 8 0 0 0 5.66-2.35l22.63-22.62a8 8 0 0 0-11.32-11.32L167.6 77.09a8 8 0 0 0 5.65 13.66M224 120h-32a8 8 0 0 0 0 16h32a8 8 0 0 0 0-16m-45.09 47.6a8 8 0 0 0-11.31 11.31l22.62 22.63a8 8 0 0 0 11.32-11.32ZM128 184a8 8 0 0 0-8 8v32a8 8 0 0 0 16 0v-32a8 8 0 0 0-8-8m-50.91-16.4l-22.63 22.62a8 8 0 0 0 11.32 11.32l22.62-22.63a8 8 0 0 0-11.31-11.31M72 128a8 8 0 0 0-8-8H32a8 8 0 0 0 0 16h32a8 8 0 0 0 8-8m-6.22-73.54a8 8 0 0 0-11.32 11.32L77.09 88.4A8 8 0 0 0 88.4 77.09Z'
      />
    </svg>
  ),
}
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>((
  {
    className, type, ...props
  }, ref,
) => {
  return (
    <div
      data-testid='spinner'
      className={cn(
        'h-6 w-6 text-[color:var(--primary)] animate-spin flex items-center justify-center animate-spin',
        className,
      )}
      ref={ref}
      {...props}
    >
      {spinners[type ?? 'long']}
    </div>
  )
})
Spinner.displayName = 'Spinner'

export { Spinner }
