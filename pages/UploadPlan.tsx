import React, { useState } from 'react';
import { UploadCloud, File, X, Loader2, CheckCircle } from 'lucide-react';
import { uploadDietPlan } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const UploadPlan: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadDietPlan(file);
      navigate('/diet-plan'); // Redirect after success
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload Diet Plan</h1>
        <p className="text-slate-500">Upload a photo or PDF of your doctor's prescribed diet.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        {!file ? (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 hover:border-primary-400 hover:bg-slate-50 transition-colors">
            <UploadCloud className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Click to upload or drag and drop</h3>
            <p className="text-slate-500 text-sm mb-6">PDF, PNG, JPG (max 5MB)</p>
            <input 
              type="file" 
              accept="image/*,application/pdf"
              className="hidden" 
              id="file-upload"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="file-upload"
              className="btn-secondary cursor-pointer inline-flex items-center"
            >
              Select File
            </label>
          </div>
        ) : (
          <div className="text-left">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500">
                   <File className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="font-medium text-slate-900 text-sm">{file.name}</p>
                   <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                 </div>
               </div>
               <button onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-red-500">
                 <X className="h-5 w-5" />
               </button>
             </div>

             <div className="flex gap-3 justify-end">
               <button onClick={() => setFile(null)} className="btn-secondary" disabled={isUploading}>Cancel</button>
               <button onClick={handleUpload} className="btn-primary flex items-center" disabled={isUploading}>
                 {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</> : 'Upload & Process'}
               </button>
             </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 text-sm text-blue-800">
        <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" />
        <p>Your uploaded plan will be processed by our system to enable the WhatsApp assistant. This usually takes 1-2 minutes.</p>
      </div>
    </div>
  );
};
