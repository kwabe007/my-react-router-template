import { cn } from '~/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const containerVariants = cva('px-6 xs:px-8 md:px-16 mx-auto', {
  variants: {
    variant: {
      default: 'max-w-[1080px]',
      includeYPadding: 'max-w-[1080px] py-8 xs:py-8 md:py-16',
    },
    size: {
      default: '',
      sm: 'max-w-[800px]',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface ContainerProps extends VariantProps<typeof containerVariants> {
  className?: string
  children?: React.ReactNode
}

export default function Container({ variant, size, className, children }: ContainerProps) {
  return <div className={cn(containerVariants({ variant, size, className }))}>{children}</div>
}
