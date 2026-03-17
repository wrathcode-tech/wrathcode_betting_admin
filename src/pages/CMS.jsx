/**
 * CMS – Teal banner, summary cards, tabs: Banners | Announcements | Static Pages.
 * Cool cards with hover, clear sections, edit modals. Data from getBanners, getAnnouncements, getStaticPages.
 */
import { useState, useMemo, useEffect } from 'react'
import {
  HiSearch,
  HiPencil,
  HiDocumentText,
  HiPhotograph,
  HiSpeakerphone,
  HiCollection,
  HiGlobe,
  HiViewGrid,
  HiViewList,
} from 'react-icons/hi'
import PageBanner from '../components/PageBanner'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../constants/roles'
import { getBanners, getAnnouncements, getStaticPages, updateBanner, updateAnnouncement, updateStaticPage } from '../services/api'

const TABS = [
  { key: 'banners', label: 'Banners', icon: HiPhotograph },
  { key: 'announcements', label: 'Announcements', icon: HiSpeakerphone },
  { key: 'pages', label: 'Static Pages', icon: HiDocumentText },
]

export default function CMS() {
  const [banners, setBanners] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [pages, setPages] = useState([])
  const [activeTab, setActiveTab] = useState('banners')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [editOpen, setEditOpen] = useState(false)
  const [editType, setEditType] = useState(null) // 'banner' | 'announcement' | 'page'
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({})
  const { addToast } = useToast()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission(PERMISSIONS.EDIT_CMS)

  useEffect(() => {
    getBanners().then((r) => setBanners(Array.isArray(r.data) ? r.data : []))
    getAnnouncements().then((r) => setAnnouncements(Array.isArray(r.data) ? r.data : []))
    getStaticPages().then((r) => setPages(Array.isArray(r.data) ? r.data : []))
  }, [])

  const filteredBanners = useMemo(() => {
    if (!search.trim()) return banners
    const q = search.toLowerCase()
    return banners.filter((b) => (b.title && b.title.toLowerCase().includes(q)))
  }, [banners, search])

  const filteredAnnouncements = useMemo(() => {
    if (!search.trim()) return announcements
    const q = search.toLowerCase()
    return announcements.filter((a) => (a.title && a.title.toLowerCase().includes(q)) || (a.content && a.content.toLowerCase().includes(q)))
  }, [announcements, search])

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages
    const q = search.toLowerCase()
    return pages.filter((p) => (p.title && p.title.toLowerCase().includes(q)) || (p.slug && p.slug.toLowerCase().includes(q)))
  }, [pages, search])

  const stats = useMemo(() => {
    const publishedB = banners.filter((b) => b.active).length
    const publishedA = announcements.filter((a) => a.active).length
    const publishedP = pages.filter((p) => p.published !== false).length
    return {
      banners: banners.length,
      announcements: announcements.length,
      pages: pages.length,
      published: publishedB + publishedA + publishedP,
    }
  }, [banners, announcements, pages])

  function openEdit(type, item) {
    setEditType(type)
    setEditingItem(item)
    if (type === 'banner') setForm({ title: item.title || '', imageUrl: item.imageUrl || '', link: item.link || '', active: item.active !== false, order: item.order != null ? item.order : 0 })
    if (type === 'announcement') setForm({ title: item.title || '', content: item.content || '', active: item.active !== false })
    if (type === 'page') setForm({ title: item.title || '', slug: item.slug || '', content: item.content || '', published: item.published !== false })
    setEditOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    if (!editingItem) return
    if (editType === 'banner') {
      updateBanner(editingItem.id, form).then(() => {
        setBanners((prev) => prev.map((b) => (b.id === editingItem.id ? { ...b, ...form } : b)))
        addToast('Banner updated', 'success')
      })
    }
    if (editType === 'announcement') {
      updateAnnouncement(editingItem.id, form).then(() => {
        setAnnouncements((prev) => prev.map((a) => (a.id === editingItem.id ? { ...a, ...form } : a)))
        addToast('Announcement updated', 'success')
      })
    }
    if (editType === 'page') {
      updateStaticPage(editingItem.id, form).then(() => {
        setPages((prev) => prev.map((p) => (p.id === editingItem.id ? { ...p, ...form, updatedAt: new Date().toISOString().slice(0, 10) } : p)))
        addToast('Page updated', 'success')
      })
    }
    setEditOpen(false)
    setEditingItem(null)
    setEditType(null)
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none'
  const btnPrimary = 'px-4 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors'
  const btnSecondary = 'px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors'

  return (
    <div className="space-y-0">
      <PageBanner title="Content Management" subtitle="Banners, announcements & static pages — manage in one place" icon={HiCollection} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <HiPhotograph className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Banners</p>
              <p className="text-lg font-bold text-gray-900">{stats.banners}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <HiSpeakerphone className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Announcements</p>
              <p className="text-lg font-bold text-gray-900">{stats.announcements}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <HiDocumentText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Static Pages</p>
              <p className="text-lg font-bold text-gray-900">{stats.pages}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <HiGlobe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Published</p>
              <p className="text-lg font-bold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-4 pt-6">
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-xl bg-gray-100 border border-gray-200">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key ? 'bg-white text-teal-600 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'banners' ? 'Search banners...' : activeTab === 'announcements' ? 'Search announcements...' : 'Search pages...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
            />
          </div>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button type="button" onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-500 hover:text-gray-800'}`} title="Grid"><HiViewGrid className="w-5 h-5" /></button>
            <button type="button" onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-500 hover:text-gray-800'}`} title="List"><HiViewList className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Banners tab */}
      {activeTab === 'banners' && (
        <div className="pt-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBanners.map((b) => (
                <div key={b.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-300 transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-sm flex items-center gap-2"><HiPhotograph className="w-8 h-8" /> No image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{b.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">Order: {b.order}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{b.active ? 'Active' : 'Inactive'}</span>
                      {canEdit && <button type="button" onClick={() => openEdit('banner', b)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"><HiPencil className="w-4 h-4" /></button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200 bg-gray-50"><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Banner</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Order</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th><th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th></tr></thead>
                <tbody>
                  {filteredBanners.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 font-medium text-gray-900">{b.title}</td>
                      <td className="py-4 px-5 text-gray-600">{b.order}</td>
                      <td className="py-4 px-5"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{b.active ? 'Active' : 'Inactive'}</span></td>
                      <td className="py-4 px-5 text-right">{canEdit && <button type="button" onClick={() => openEdit('banner', b)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50"><HiPencil className="w-4 h-4" /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredBanners.length === 0 && <EmptyState title="No banners" message="Add banners or adjust search." />}
        </div>
      )}

      {/* Announcements tab */}
      {activeTab === 'announcements' && (
        <div className="pt-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnnouncements.map((a) => (
                <div key={a.id} className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 flex-1">{a.title}</h3>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${a.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{a.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{a.content}</p>
                  <p className="text-gray-400 text-xs mt-2">{a.createdAt}</p>
                  {canEdit && <button type="button" onClick={() => openEdit('announcement', a)} className="mt-3 p-2 rounded-lg text-teal-600 hover:bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"><HiPencil className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200 bg-gray-50"><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Title</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Content</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Date</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th><th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th></tr></thead>
                <tbody>
                  {filteredAnnouncements.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 font-medium text-gray-900">{a.title}</td>
                      <td className="py-4 px-5 text-gray-600 text-sm max-w-[200px] truncate">{a.content}</td>
                      <td className="py-4 px-5 text-gray-500 text-sm">{a.createdAt}</td>
                      <td className="py-4 px-5"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${a.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{a.active ? 'Active' : 'Inactive'}</span></td>
                      <td className="py-4 px-5 text-right">{canEdit && <button type="button" onClick={() => openEdit('announcement', a)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50"><HiPencil className="w-4 h-4" /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredAnnouncements.length === 0 && <EmptyState title="No announcements" message="Add announcements or adjust search." />}
        </div>
      )}

      {/* Static Pages tab */}
      {activeTab === 'pages' && (
        <div className="pt-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPages.map((p) => (
                <div key={p.id} className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <HiDocumentText className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                      <p className="text-gray-500 text-sm">/{p.slug}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Updated {p.updatedAt || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${p.published !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{p.published !== false ? 'Published' : 'Draft'}</span>
                    {canEdit && <button type="button" onClick={() => openEdit('page', p)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"><HiPencil className="w-4 h-4" /></button>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead><tr className="border-b border-gray-200 bg-gray-50"><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Page</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Slug</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Updated</th><th className="text-left py-4 px-5 text-gray-600 font-semibold text-sm">Status</th><th className="text-right py-4 px-5 text-gray-600 font-semibold text-sm">Actions</th></tr></thead>
                <tbody>
                  {filteredPages.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-5 font-medium text-gray-900">{p.title}</td>
                      <td className="py-4 px-5 text-gray-600 font-mono text-sm">/{p.slug}</td>
                      <td className="py-4 px-5 text-gray-500 text-sm">{p.updatedAt || '—'}</td>
                      <td className="py-4 px-5"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${p.published !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{p.published !== false ? 'Published' : 'Draft'}</span></td>
                      <td className="py-4 px-5 text-right">{canEdit && <button type="button" onClick={() => openEdit('page', p)} className="p-2 rounded-lg text-teal-600 hover:bg-teal-50"><HiPencil className="w-4 h-4" /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredPages.length === 0 && <EmptyState title="No pages" message="Add static pages or adjust search." />}
        </div>
      )}

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditingItem(null); setEditType(null); }} title={editingItem ? `Edit ${editType}` : 'Edit'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {editType === 'banner' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label><input type="text" value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label><input type="text" value={form.imageUrl || ''} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className={inputClass} placeholder="/banner.jpg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Link</label><input type="text" value={form.link || ''} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className={inputClass} placeholder="/games" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Order</label><input type="number" min="0" value={form.order ?? 0} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} className={inputClass} /></div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.active !== false} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" /><span className="text-gray-600 text-sm">Active</span></label>
            </>
          )}
          {editType === 'announcement' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label><input type="text" value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label><textarea value={form.content || ''} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className={inputClass} rows={4} /></div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.active !== false} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" /><span className="text-gray-600 text-sm">Active</span></label>
            </>
          )}
          {editType === 'page' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label><input type="text" value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label><input type="text" value={form.slug || ''} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputClass} placeholder="terms" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label><textarea value={form.content || ''} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className={inputClass} rows={6} placeholder="HTML or Markdown..." /></div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.published !== false} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" /><span className="text-gray-600 text-sm">Published</span></label>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <button type="submit" className={btnPrimary}>Save</button>
            <button type="button" onClick={() => { setEditOpen(false); setEditingItem(null); setEditType(null); }} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
