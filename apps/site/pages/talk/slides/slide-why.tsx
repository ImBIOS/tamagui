import { Slide } from 'components/Slide'
import React from 'react'
import { memo } from 'react'

export default memo(() => {
  return (
    <Slide
      theme="orange"
      steps={[
        [
          {
            type: 'callout',
            content: `Why?`,
          },
        ],
      ]}
    />
  )
})
