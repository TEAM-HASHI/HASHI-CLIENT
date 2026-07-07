import {
  createContext,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
  type RefObject,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Dialog as AriaDialog,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from 'react-aria-components'

import { cn } from '../../utils'

export type DialogType = 'dialog' | 'alertdialog'

export type DialogRootProps = PropsWithChildren<{
  type?: DialogType
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}>

export type DialogTriggerProps = AriaButtonProps
export type DialogContentProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'role'
>
export type DialogHeaderProps = ComponentPropsWithoutRef<'div'>
export type DialogIconProps = ComponentPropsWithoutRef<'span'>
export type DialogTitleProps = ComponentPropsWithoutRef<'h2'>
export type DialogDescriptionProps = ComponentPropsWithoutRef<'p'>
export type DialogBodyProps = ComponentPropsWithoutRef<'div'>
export type DialogFooterProps = ComponentPropsWithoutRef<'div'>
export type DialogCloseProps = AriaButtonProps

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  type: DialogType
  descriptionId: string
  hasDescription: boolean
  setHasDescription: (hasDescription: boolean) => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

const DialogContext = createContext<DialogContextValue | null>(null)

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const useDialogContext = (componentName: string) => {
  const context = useContext(DialogContext)

  if (!context) {
    throw new Error(`${componentName} must be used within Dialog.Root`)
  }

  return context
}

const useControllableOpen = ({
  open,
  defaultOpen = false,
  onOpenChange,
}: Pick<DialogRootProps, 'open' | 'defaultOpen' | 'onOpenChange'>) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : uncontrolledOpen

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  return [currentOpen, setOpen] as const
}

const getFocusableElements = (container: HTMLElement) => {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.hasAttribute('disabled'))
    .filter((element) => element.getAttribute('aria-hidden') !== 'true')
}

const focusFirstElement = (container: HTMLElement) => {
  const [firstFocusableElement] = getFocusableElements(container)

  if (firstFocusableElement) {
    firstFocusableElement.focus()
    return
  }

  container.focus()
}

const Root = ({
  type = 'dialog',
  open,
  defaultOpen,
  onOpenChange,
  children,
}: DialogRootProps) => {
  const [currentOpen, setOpen] = useControllableOpen({
    defaultOpen,
    onOpenChange,
    open,
  })
  const descriptionId = `${useId()}-description`
  const [hasDescription, setHasDescription] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const value = useMemo<DialogContextValue>(
    () => ({
      descriptionId,
      hasDescription,
      open: currentOpen,
      setOpen,
      setHasDescription,
      triggerRef,
      type,
    }),
    [currentOpen, descriptionId, hasDescription, setOpen, triggerRef, type],
  )

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  )
}

const Trigger = ({
  children,
  onPress,
  type = 'button',
  ...props
}: DialogTriggerProps) => {
  const { setOpen, triggerRef } = useDialogContext('Dialog.Trigger')

  return (
    <AriaButton
      {...props}
      onPress={(event) => {
        onPress?.(event)
        setOpen(true)
      }}
      ref={triggerRef}
      type={type}
    >
      {children}
    </AriaButton>
  )
}

const Content = ({
  children,
  className,
  'aria-label': ariaLabel,
  ...props
}: DialogContentProps) => {
  const { descriptionId, hasDescription, open, setOpen, triggerRef, type } =
    useDialogContext('Dialog.Content')
  const contentRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (!open || typeof document === 'undefined') {
      return
    }

    const previouslyFocusedElement = document.activeElement
    const contentElement = contentRef.current

    if (contentElement) {
      focusFirstElement(contentElement)
    }

    return () => {
      if (
        triggerRef.current &&
        previouslyFocusedElement === triggerRef.current
      ) {
        triggerRef.current.focus()
      }
    }
  }, [open, triggerRef])

  return (
    <AriaModalOverlay
      className="z-modal fixed inset-0 flex items-center justify-center bg-black/40 px-6"
      data-hds-dialog-overlay=""
      isDismissable={type === 'dialog'}
      isOpen={open}
      onOpenChange={setOpen}
    >
      <AriaModal>
        <AriaDialog
          {...props}
          aria-describedby={hasDescription ? descriptionId : undefined}
          aria-label={ariaLabel}
          className={cn(
            'flex w-[327px] max-w-[calc(100vw-48px)] flex-col items-center overflow-hidden rounded-[15px] bg-white px-[27px] py-[26px]',
            className,
          )}
          ref={contentRef}
          render={(dialogProps) => (
            <section {...dialogProps} aria-modal="true" />
          )}
          role={type}
        >
          {children}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  )
}

const Header = ({ className, children, ...props }: DialogHeaderProps) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-3 text-center',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const Icon = ({ className, children, ...props }: DialogIconProps) => {
  return (
    <span
      aria-hidden="true"
      className={cn('flex size-6 items-center justify-center', className)}
      {...props}
    >
      {children}
    </span>
  )
}

const Title = ({ className, children, ...props }: DialogTitleProps) => {
  return (
    <AriaHeading
      {...props}
      className={cn(
        'typo-header-3 text-cool-gray-900 m-0 max-w-full text-center break-keep',
        className,
      )}
      level={2}
      slot="title"
    >
      {children}
    </AriaHeading>
  )
}

const Description = ({
  className,
  children,
  ...props
}: DialogDescriptionProps) => {
  const { descriptionId, setHasDescription } =
    useDialogContext('Dialog.Description')

  useLayoutEffect(() => {
    setHasDescription(true)

    return () => {
      setHasDescription(false)
    }
  }, [setHasDescription])

  return (
    <p
      className={cn(
        'text-cool-gray-500 m-0 max-w-full text-center text-[14px] leading-5 break-keep',
        className,
      )}
      id={descriptionId}
      {...props}
    >
      {children}
    </p>
  )
}

const Body = ({ className, children, ...props }: DialogBodyProps) => {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
}

const Footer = ({ className, children, ...props }: DialogFooterProps) => {
  return (
    <div
      className={cn(
        'mt-6 flex w-full gap-2 [&>*]:min-w-0 [&>*]:flex-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const Close = ({
  children,
  onPress,
  type = 'button',
  ...props
}: DialogCloseProps) => {
  const { setOpen, triggerRef } = useDialogContext('Dialog.Close')

  return (
    <AriaButton
      {...props}
      onPress={(event) => {
        onPress?.(event)
        setOpen(false)
        triggerRef.current?.focus()
      }}
      type={type}
    >
      {children}
    </AriaButton>
  )
}

export const Dialog = {
  Root,
  Trigger,
  Content,
  Header,
  Icon,
  Title,
  Description,
  Body,
  Footer,
  Close,
}
