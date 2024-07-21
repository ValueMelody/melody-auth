import type { Config } from 'tailwindcss'
import {
  content, plugin,
} from 'flowbite-react/tailwind'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    content({ base: '../' }),
  ],
  plugins: [
    plugin(),
  ],
}
export default config
