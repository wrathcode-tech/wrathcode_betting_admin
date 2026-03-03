import { HiOutlineInbox } from 'react-icons/hi'

export default function EmptyState({ icon: Icon = HiOutlineInbox, title = 'No data', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-gray-50 border border-gray-200 border-dashed">
      <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {message && <p className="text-gray-500 text-sm mt-1 text-center max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
