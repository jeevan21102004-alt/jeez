import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ImageUpload({ onDetected }) {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const onDrop = async (accepted) => {
    const file = accepted?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    const form = new FormData();
    form.append('file', file);

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/ai/analyze-food-image', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      onDetected(data);
      toast.success('AI analysis complete');
    } catch {
      toast.error('Image analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  return (
    <div className="space-y-3">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        className={`cursor-pointer rounded-2xl border border-dashed p-6 text-center ${
          isDragActive ? 'border-[var(--accent-from)] bg-[var(--accent-from)]/10' : 'border-border-line bg-bg-card'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-txt-main/80">Drag and drop a food image, or tap to upload</p>
      </motion.div>
      {preview && <img src={preview} alt="preview" className="h-44 w-full rounded-xl object-cover" />}
      {loading && <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-accent-from to-[var(--copper-main)]" /></div>}
    </div>
  );
}
