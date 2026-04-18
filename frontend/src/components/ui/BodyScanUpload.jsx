import { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import BodyScanResult from './BodyScanResult';

export default function BodyScanUpload({ onUseEstimates }) {
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [previewBase64, setPreviewBase64] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultData, setResultData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       toast.error('Please upload an image file');
       return;
    }

    setFileType(file.type);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewBase64(event.target.result);
      setResultData(null); // Clear previous results if new photo uploaded
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!previewBase64) return;
    
    setAnalyzing(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/analyze-body', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: previewBase64,
          media_type: fileType
        })
      });

      if (!res.ok) throw new Error('Analysis request failed');
      const data = await res.json();
      
      if (data.status === 'success') {
         setResultData(data.data);
         toast.success('Analysis complete!');
      } else {
         toast.error(data.detail || 'Analysis failed');
      }
    } catch (err) {
      toast.error('Failed to connect to AI engine.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (resultData) {
     return (
       <div className="space-y-4">
         <BodyScanResult data={resultData} onUseEstimates={onUseEstimates} />
         <button 
           onClick={() => { setPreviewBase64(null); setResultData(null); }}
           className="w-full text-xs text-txt-main/50 hover:text-txt-main/80 underline"
         >
           Scan another photo
         </button>
       </div>
     );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border-line bg-bg-card p-4">
      {!agreedToPrivacy ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-[var(--accent-from)]/10 p-3 rounded-lg border border-[var(--accent-from)]/20">
            <ShieldCheck size={20} className="text-[var(--accent-from)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-txt-main">Privacy First</h4>
              <p className="text-xs text-txt-main/70 mt-1">
                Your photo is securely sent to AI for immediate assessment and is computationally destroyed in-memory. It is never stored on our servers or trained on.
              </p>
            </div>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white/5 rounded-md transition border border-transparent">
            <input 
              type="checkbox" 
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              className="rounded border-border-line text-[var(--accent-from)] focus:ring-[var(--accent-from)] bg-black"
            />
            <span className="text-sm text-txt-main/80">I agree to the privacy terms</span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <input 
            type="file" 
            accept="image/*" 
            capture="user"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {!previewBase64 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-border-line rounded-xl py-8 cursor-pointer hover:border-white/30 transition bg-black/20"
            >
              <Camera size={32} className="text-txt-main/40 mb-3" />
              <p className="text-sm font-medium text-txt-main/80">Take a photo or upload</p>
              <p className="text-xs text-txt-main/40 mt-1">Stand straight, natural lighting</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-border-line bg-black/50">
                <img 
                  src={previewBase64} 
                  alt="Physique preview" 
                  className="object-cover w-full h-full opacity-80"
                />
                <button
                  onClick={() => setPreviewBase64(null)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-black/80"
                >
                  ✕
                </button>
              </div>

              <Button 
                className="w-full" 
                onClick={handleAnalyze} 
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing Physique...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" /> 
                    Analyze my physique
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
