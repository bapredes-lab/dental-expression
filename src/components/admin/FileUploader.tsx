import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploaderProps {
    onUpload: (files: File[]) => void;
    maxFiles?: number;
    acceptedTypes?: Record<string, string[]>;
}

export function FileUploader({
    onUpload,
    maxFiles = 5,
    acceptedTypes = {
        'image/*': ['.jpeg', '.png', '.jpg'],
        'application/pdf': ['.pdf'],
        'application/dicom': ['.dcm'] // Placeholder DICOM mime
    }
}: FileUploaderProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles)
        setSelectedFiles(newFiles)
    }, [selectedFiles, maxFiles])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedTypes,
        maxFiles
    })

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleUploadClick = () => {
        if (selectedFiles.length > 0) {
            onUpload(selectedFiles)
            setSelectedFiles([])
        }
    }

    return (
        <div className="w-full space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
        `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                    <UploadCloud className={`h-10 w-10 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium text-gray-700">
                        {isDragActive ? "Suelta los archivos aquí..." : "Arrastra y suelta archivos aquí, o haz clic para seleccionar"}
                    </p>
                    <p className="text-xs text-gray-500">
                        Soporta JPG, PNG, PDF, DICOM (Max {maxFiles} archivos)
                    </p>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="space-y-4">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-gray-50 border rounded-md">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm truncate text-gray-700 font-medium">
                                        {file.name}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    onClick={() => removeFile(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-end">
                        <Button onClick={handleUploadClick}>
                            Subir {selectedFiles.length} Archivo(s)
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
