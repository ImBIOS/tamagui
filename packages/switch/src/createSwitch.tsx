import {
  NativeValue,
  SizeTokens,
  Stack,
  StackProps,
  TamaguiComponentExpectingVariants,
  composeEventHandlers,
  isWeb,
  shouldRenderNativePlatform,
  useProps,
  withStaticProperties,
} from '@tamagui/core'
import {
  SwitchExtraProps as HeadlessSwitchExtraProps,
  SwitchState,
  useSwitch,
} from '@tamagui/switch-headless'
import { useControllableState } from '@tamagui/use-controllable-state'
import * as React from 'react'
import {
  Switch as NativeSwitch,
  SwitchProps as NativeSwitchProps,
  ViewProps,
} from 'react-native'

import { SwitchStyledContext } from './StyledContext'
import { SwitchFrame as DefaultSwitchFrame, SwitchThumb } from './Switch'

type ExpectingVariantProps = {
  size?: SizeTokens | number
  unstyled?: boolean
}

type SwitchBaseProps = StackProps & ExpectingVariantProps

export type SwitchExtraProps = HeadlessSwitchExtraProps & {
  native?: NativeValue<'mobile' | 'ios' | 'android'>
  nativeProps?: NativeSwitchProps
}

export type SwitchProps = SwitchBaseProps & SwitchExtraProps

type SwitchComponent = TamaguiComponentExpectingVariants<
  SwitchProps & ExpectingVariantProps,
  ExpectingVariantProps
>

type SwitchThumbBaseProps = StackProps
type SwitchThumbExtraProps = {}
export type SwitchThumbProps = SwitchThumbBaseProps & SwitchThumbExtraProps

type SwitchThumbComponent = TamaguiComponentExpectingVariants<
  SwitchThumbProps & ExpectingVariantProps,
  ExpectingVariantProps
>

export const SwitchContext = React.createContext<{
  checked: SwitchState
  frameWidth: number
  disabled?: boolean
}>({
  checked: false,
  disabled: false,
  frameWidth: 0,
})

export function createSwitch<F extends SwitchComponent, T extends SwitchThumbComponent>({
  disableActiveTheme,
  Frame = DefaultSwitchFrame as any,
  Thumb = SwitchThumb as any,
}: {
  disableActiveTheme?: boolean
  Frame?: F
  Thumb?: T
}) {
  if (process.env.NODE_ENV === 'development') {
    if (
      // @ts-ignore
      (Frame !== DefaultSwitchFrame && Frame.staticConfig.context) ||
      // @ts-ignore
      (Thumb !== SwitchThumb && Thumb.staticConfig.context)
    ) {
      console.warn(
        `Warning: createSwitch() needs to control context to pass checked state from Frame to Thumb, any custom context passed will be overridden.`
      )
    }
  }

  Frame.staticConfig.context = SwitchStyledContext
  Thumb.staticConfig.context = SwitchStyledContext

  const SwitchThumbComponent = Thumb.styleable(function SwitchThumb(props, forwardedRef) {
    const { size: sizeProp, unstyled: unstyledProp, nativeID, ...thumbProps } = props
    const context = React.useContext(SwitchContext)
    const { checked, disabled, frameWidth } = context
    // __scope?
    const styledContext = SwitchStyledContext.useStyledContext()
    const { unstyled: unstyledContext, size: sizeContext } = styledContext
    const unstyled =
      process.env.TAMAGUI_HEADLESS === '1'
        ? true
        : unstyledProp ?? unstyledContext ?? false
    const size = sizeProp ?? sizeContext ?? '$true'

    const initialChecked = React.useRef(checked).current

    const [thumbWidth, setThumbWidth] = React.useState(0)
    const distance = frameWidth - thumbWidth
    const x = initialChecked ? (checked ? 0 : -distance) : checked ? distance : 0
    return (
      // @ts-ignore
      <Thumb
        ref={forwardedRef}
        unstyled={unstyled}
        {...(unstyled === false && {
          size,
          ...(!disableActiveTheme && {
            theme: checked ? 'active' : null,
          }),
        })}
        alignSelf={initialChecked ? 'flex-end' : 'flex-start'}
        x={x}
        // TODO: remove ViewProps cast
        onLayout={composeEventHandlers((props as ViewProps).onLayout, (e) =>
          setThumbWidth(e.nativeEvent.layout.width)
        )}
        // expected variants
        checked={checked}
        disabled={disabled}
        {...thumbProps}
      />
    )
  })

  const SwitchComponent = Frame.styleable(
    function SwitchFrame(_props, forwardedRef) {
      const {
        native,
        nativeProps,
        checked: checkedProp,
        defaultChecked,
        onCheckedChange,
        ...props
      } = _props
      const [checked, setChecked] = useControllableState({
        prop: checkedProp,
        defaultProp: defaultChecked || false,
        onChange: onCheckedChange,
        transition: true,
      })

      const styledContext = React.useContext(SwitchStyledContext.context)

      const [frameWidth, setFrameWidth] = React.useState(0)

      const propsActive = useProps(props, {
        noNormalize: true,
        noExpand: true,
        resolveValues: 'none',
        forComponent: Frame,
      })
      propsActive.size = styledContext.size ?? props.size ?? '$true'
      propsActive.unstyled = styledContext.unstyled ?? props.unstyled ?? false

      const { switchProps, bubbleInput, switchRef } = useSwitch(
        // @ts-ignore
        propsActive,
        [checked, setChecked],
        forwardedRef
      )

      const renderNative = shouldRenderNativePlatform(native)
      if (renderNative === 'android' || renderNative === 'ios') {
        return (
          <NativeSwitch value={checked} onValueChange={setChecked} {...nativeProps} />
        )
      }

      return (
        <SwitchContext.Provider value={{ checked, disabled: switchProps.disabled, frameWidth }}>
          <Frame
            ref={switchRef}
            tag="button"
            {...(isWeb && { type: 'button' })}
            {...(switchProps as any)}
            {...(!disableActiveTheme && {
              theme: checked ? 'active' : null,
              themeShallow: true,
            })}
            // expected variants
            checked={checked}
            disabled={switchProps.disabled}
          >
            <Stack
              alignSelf="stretch"
              flex={1}
              onLayout={(e) => {
                setFrameWidth(e.nativeEvent.layout.width)
              }}
            >
              {switchProps.children}
            </Stack>
          </Frame>

          {bubbleInput}
        </SwitchContext.Provider>
      )
    },
    {
      disableTheme: true,
    }
  )

  return withStaticProperties(SwitchComponent, {
    Thumb: SwitchThumbComponent,
  })
}
