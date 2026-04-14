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

export const renderProgress = ({ value, row, getPercentage, progressMap }) => {
  const percentage = getPercentage?.(value, row) ?? progressMap?.[value] ?? 0
  return h(components.OProgress, {
    percentage,
    textInside: true,
  })
}

export const renderProgressColumn = ({
  label = '处理进度',
  prop = 'progress',
  width = 120,
  getPercentage,
  progressMap = {
    '000': 0,
    '001': 20,
    '010': 40,
    '002': 60,
    '003': 80,
    '004': 100,
  },
  ...rest
}) => {
  return {
    label,
    prop,
    width,
    render: ({ value, row }) => renderProgress({ value, row, getPercentage, progressMap }),
    ...rest,
  }
}
