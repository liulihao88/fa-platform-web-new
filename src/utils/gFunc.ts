import { h } from 'vue'
import components from 'oeos-components'
export const renderWarnNumber = ({ value }) => {
  const displayValue = value ?? '-'
  if (Number(value) > 0) {
    return h(
      components.OTag,
      {
        type: 'danger',
        effect: 'dark',
        width: '100%',
      },
      () => displayValue,
    )
  }

  return displayValue
}
