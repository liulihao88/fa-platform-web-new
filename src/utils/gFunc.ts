import { h } from 'vue'
import components from 'oeos-components'

const defaultProgressMap = {
  '000': 0,
  '001': 20,
  '010': 40,
  '002': 60,
  '003': 80,
  '004': 100,
}

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
  const percentage = getPercentage?.(value, row) ?? progressMap?.[value] ?? Number(value ?? 0)
  return h(components.OProgress, {
    percentage,
    textInside: true,
  })
}

export const renderProgressColumn = ({
  label = '处理进度',
  prop = 'status',
  width = 100,
  getPercentage,
  progressMap = defaultProgressMap,
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
