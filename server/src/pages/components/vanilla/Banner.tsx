import { useMemo } from 'hono/jsx'

const InfoIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      class='lucide lucide-info-icon lucide-info'><circle
        cx='12'
        cy='12'
        r='10'/><path d='M12 16v-4'/><path d='M12 8h.01'/></svg>
  )
}

const WarningIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      class='lucide lucide-triangle-alert-icon lucide-triangle-alert'><path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/><path d='M12 9v4'/><path d='M12 17h.01'/></svg>
  )
}

const ErrorIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      class='lucide lucide-circle-x-icon lucide-circle-x'><circle
        cx='12'
        cy='12'
        r='10'/><path d='m15 9-6 6'/><path d='m9 9 6 6'/></svg>
  )
}

const SuccessIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      class='lucide lucide-circle-check-icon lucide-circle-check'><circle
        cx='12'
        cy='12'
        r='10'/><path d='m9 12 2 2 4-4'/></svg>
  )
}

const Banner = ({
  type,
  text,
}: {
  type: string;
  text: string;
}) => {
  const alertClasses = useMemo(
    () => {
      switch (type) {
      case 'info':
        return 'text-blue-500'
      case 'warning':
        return 'text-yellow-500'
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      }
    },
    [type],
  )

  const icon = useMemo(
    () => {
      switch (type) {
      case 'info':
        return <InfoIcon />
      case 'warning':
        return <WarningIcon />
      case 'success':
        return <SuccessIcon />
      case 'error':
        return <ErrorIcon />
      }
    },
    [type],
  )

  return (
    <div
      role='alert'
      className={`flex gap-2 items-start w-(--text-width) rounded-lg border px-4 py-3 text-sm ${alertClasses}`}>
      <div className='min-w-6 min-h-6'>
        {icon}
      </div>
      <div className='flex-1'>
        {text}
      </div>
    </div>
  )
}

export default Banner
