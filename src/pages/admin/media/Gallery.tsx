import { useState, useEffect } from 'react'
import { FileUploader } from '../../../components/admin/FileUploader'
import { Folder, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function MediaGallery() {
    const [media, setMedia] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('Todas')
    const categories = ['Todas', 'before', 'after', 'xray', 'clinical']
    const categoryLabels: Record<string, string> = {
        'Todas': 'Todas',
        'before': 'Antes',
        'after': 'Después',
        'xray': 'Radiografías',
        'clinical': 'Clínica'
    }

    useEffect(() => {
        fetchMedia()
    }, [])

    const fetchMedia = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('media_pacientes')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error && data) {
                setMedia(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (files: File[]) => {
        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `uploads/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('expedientes-medicos')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('expedientes-medicos')
                    .getPublicUrl(filePath)

                const { error: dbError } = await supabase
                    .from('media_pacientes')
                    .insert([{
                        url: publicUrl,
                        tipo: activeCategory === 'Todas' ? 'clinical' : activeCategory,
                    }])

                if (dbError) throw dbError

            } catch (error: any) {
                alert(`Error al subir ${file.name}: ${error.message}`)
            }
        }
        fetchMedia()
    }

    const filteredMedia = activeCategory === 'Todas'
        ? media
        : media.filter(m => m.tipo === activeCategory)

    return (
        <div className="space-y-6">
            {/* TEXTO DE PRUEBA PARA VERIFICAR ACTUALIZACIÓN */}
            <div className="bg-amber-100 p-2 text-center text-[10px] font-bold text-amber-800 rounded-lg">
                SISTEMA CONECTADO A SUPABASE REAL V1.0
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Multimedia y Documentos</h2>
                    <p className="text-muted-foreground mt-1">Sube y organiza fotos, radiografías e historias clínicas.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-medium mb-4">Subir Nuevos Archivos</h3>
                        <FileUploader onUpload={handleUpload} maxFiles={10} />
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="flex space-x-2 overflow-x-auto pb-4 mb-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                     ${activeCategory === cat ? 'bg-[#052c46] text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                   `}
                                >
                                    {categoryLabels[cat]}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {loading ? (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sincronizando Galería...</p>
                                </div>
                            ) : filteredMedia.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => window.open(item.url, '_blank')}
                                    className="group relative rounded-2xl border bg-white overflow-hidden cursor-pointer hover:border-emerald-500 transition-all shadow-sm luxury-shadow"
                                >
                                    <div className="aspect-square flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                                        <img src={item.url} alt="Media" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ImageIcon className="text-white h-8 w-8" />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{categoryLabels[item.tipo]}</p>
                                        <p className="text-[9px] text-slate-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {!loading && filteredMedia.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500">
                                    <Folder className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <p>No hay archivos en esta categoría.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
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
