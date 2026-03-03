export default function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-4 rounded bg-gray-200 mb-2 last:mb-0" style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }} />
      ))}
    </div>
  )
}
