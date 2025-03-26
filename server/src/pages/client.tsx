import { render } from 'hono/jsx/dom'
import './client.css'

import Main from './Main'

const root = document.getElementById('root')!
render(
  <Main />,
  root,
)
