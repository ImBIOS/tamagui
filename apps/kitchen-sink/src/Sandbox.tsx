// debug-verbose
// import './wdyr'

import { DialogDemo } from '@tamagui/demos'
import { View as RNView } from 'react-native'
import { View, styled, usePropsAndStyle } from 'tamagui'

import { TextInput } from 'react-native'
const MyInput = styled(
  TextInput,
  {
    placeholder: 'Test',
  },
  {
    acceptTokens: { placeholderTextColor: 'color' },
  }
)

function MyInputWrapper() {
  return <MyInput debug="verbose" placeholderTextColor="$accentBackground" />
}

export const Sandbox = () => {
  return (
    <RNView style={{ width: '100%', height: '100%', padding: 50 }}>
      <MyInputWrapper />
    </RNView>
  )
}

const Demo = () => (
  <View f={1} ai="center" jc="center">
    <View
      bg="$green7"
      h={200}
      w={200}
      br={0}
      animation="lazy"
      pressStyle={{
        scale: 0.75,
        br: '$10',
      }}
    />
  </View>
)

// animationKeyframes: {
//   from: {
//     opacity: 0,
//     transform: [{ translateY: 50 }],
//   },
//   to: {
//     opacity: 1,
//     transform: [{ translateY: 0 }],
//   },
// },
// animationDuration: '0.8s',
// animationFillMode: 'both',
// animationDelay: '800ms',
