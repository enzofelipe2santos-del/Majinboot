import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';

export default function FileDropZone({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    console.log('Archivos listos para subir', acceptedFiles);
    setIsDragging(false);
    onUploaded?.();
  }, [onUploaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`glass-card p-6 border-2 border-dashed ${isDragging ? 'border-sky-400 bg-sky/20' : 'border-white/50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-200">
        <FiUploadCloud className="text-2xl" />
        <div>
          <p className="text-sm font-semibold">Arrastra archivos multimedia</p>
          <p className="text-xs">Imágenes, videos, audios o PDFs</p>
        </div>
      </div>
    </div>
  );
}
