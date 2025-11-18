import { createTheme } from '@mui/material'
import breakPoint from './breakpoint'
import colorTheme from './colorTheme'
import typography from './typography'
import applyCustomTypoGraphy from './typography'

const theme = createTheme({
  ...breakPoint,
  ...colorTheme,
  ...typography,
  shape: {
    borderRadius: 4
  },
  spacing: [0, 4, 8, 12, 16, 24, 32,48, 64]



})
export default applyCustomTypoGraphy(theme)