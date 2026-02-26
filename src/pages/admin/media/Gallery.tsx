import { useState } from 'react'
import { FileUploader } from '@/components/admin/FileUploader'
import { Folder, Image as ImageIcon, FileText } from 'lucide-react'

// Mock Data for MVP
const mockMedia = [
    { id: 1, type: 'image', category: 'Extraoral', url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=200&h=200', name: 'sonrisa.jpg', date: '2024-03-15' },
    { id: 2, type: 'image', category: 'Intraoral', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=200&h=200', name: 'arco_superior.jpg', date: '2024-03-15' },
    { id: 3, type: 'pdf', category: 'Historia Clínica', url: '#', name: 'historia_clinica_v1.pdf', date: '2024-03-10' },
]

export default function MediaGallery() {
    const [activeCategory, setActiveCategory] = useState('Todas')
    const categories = ['Todas', 'Extraoral', 'Intraoral', 'Radiografías', 'Historia Clínica']

    const handleUpload = (files: File[]) => {
        // Implement Supabase Storage Upload here
        console.log('Got files to upload:', files)
        alert(`Se seleccionaron ${files.length} archivos para subir. La conexión a Supabase se hará con las credenciales activas.`)
    }

    const filteredMedia = activeCategory === 'Todas'
        ? mockMedia
        : mockMedia.filter(m => m.category === activeCategory)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Multimedia y Documentos</h2>
                    <p className="text-muted-foreground mt-1">Sube y organiza fotos, radiografías e historias clínicas.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Upload Area */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-medium mb-4">Subir Nuevos Archivos</h3>
                        <FileUploader onUpload={handleUpload} maxFiles={10} />
                    </div>

                    {/* Gallery Grid */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="flex space-x-2 overflow-x-auto pb-4 mb-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                     ${activeCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                   `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredMedia.map((item) => (
                                <div key={item.id} className="group relative rounded-lg border bg-gray-50 overflow-hidden cursor-pointer hover:border-primary transition-colors">
                                    <div className="aspect-square flex-col flex items-center justify-center p-2 bg-gray-100 relative">
                                        {item.type === 'image' ? (
                                            <>
                                                <img src={item.url} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ImageIcon className="text-white h-8 w-8" />
                                                </div>
                                            </>
                                        ) : (
                                            <FileText className="h-12 w-12 text-gray-400 group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-medium truncate" title={item.name}>{item.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{item.category} • {item.date}</p>
                                    </div>
                                </div>
                            ))}
                            {filteredMedia.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500">
                                    <Folder className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <p>No hay archivos en esta categoría.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Info Sidebar */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                        <h3 className="font-semibold text-primary mb-2">Información del Almacenamiento</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Los archivos se organizan por paciente y categoría (Fotos extraorales, intraorales, radiografías, etc).
                        </p>
                        <ul className="text-sm space-y-2 text-gray-600">
                            <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-secondary mr-2" />JPG, PNG para fotos</li>
                            <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-secondary mr-2" />PDF para Historias</li>
                            <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-secondary mr-2" />DICOM para Tomografías</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
