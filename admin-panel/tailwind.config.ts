import type { Config } from 'tailwindcss'
import {
  content, plugin,
} from 'flowbite-react/tailwind'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    content({ base: '../' }),
  ],
  plugins: [
    plugin(),
  ],
}
export default config
