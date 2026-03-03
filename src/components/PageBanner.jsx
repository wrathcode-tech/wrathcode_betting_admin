/**
 * Reusable page banner – greeting + date, title, subtitle, optional Live button + icon.
 * Same UI across all pages (teal rounded, PlayAdd / BetFury style).
 */
import { HiStatusOnline, HiChartBar } from 'react-icons/hi'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDateString() {
  const d = new Date()
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default function PageBanner({ title, subtitle, showLive = false, icon: Icon = HiChartBar }) {
  return (
    <div className="dashboard_hd_top">
      <div className="full_width flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-white/90 text-base">{getGreeting()} {getDateString()}</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">{title}</h1>
          {subtitle && <p className="text-white/90 text-base mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon className="w-8 h-8 text-white/80" />
          {showLive && <span className="px-4 py-2 rounded-lg bg-white/20 text-base font-medium">Live</span>}
        </div>
      </div>
    </div>
  )
}
