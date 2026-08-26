import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { detectCropDisease } from '../../services/diseaseService';
import BackButton from '../../components/BackButton';
import { FaMicroscope, FaUpload, FaLeaf, FaShieldAlt, FaComments, FaCheckCircle, FaExclamationTriangle, FaSeedling, FaBolt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DiseaseDetection = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, AVIF)');
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please upload a leaf photo to scan');
      return;
    }

    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const res = await detectCropDisease(formData);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Crop Leaf Scan Complete! 🔬');
      } else {
        throw new Error(res.message || 'Diagnosis failed');
      }
    } catch (err) {
      console.error('Disease scan error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to analyze image. Please try again.';
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="page-fade-in max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <BackButton fallback="/farmer/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-premium mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-harvest-300 border border-white/20 mb-3">
            <FaMicroscope /> AI Crop Doctor & Plant Pathology Engine
          </div>
          <h1 className="page-heading text-white mb-2">Instant Crop Disease Diagnosis</h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-medium">
            Upload a photo of affected crop leaves or stems to identify pathogens, fungal blights, and receive tailored chemical & organic remedy protocols.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Upload Card */}
        <div className="card-saas p-6 sm:p-8">
          <h2 className="section-heading text-lg sm:text-xl mb-4 font-display">Upload Crop Leaf Photo</h2>

          <form onSubmit={handleScanSubmit} className="space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-surface-300 rounded-3xl p-8 text-center cursor-pointer hover:border-brand-500 hover:bg-emerald-50/40 transition-all relative overflow-hidden group"
            >
              {analyzing && <div className="scanner-laser"></div>}

              {preview ? (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Crop preview"
                    className="max-h-64 mx-auto rounded-2xl object-cover shadow-sm border border-surface-200"
                  />
                  <p className="text-xs font-bold text-brand-700">Click to choose a different photo</p>
                </div>
              ) : (
                <div className="space-y-3 py-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-brand-700 mx-auto flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform">
                    <FaUpload />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-900">Click or drag crop leaf photo here</p>
                    <p className="text-[11px] text-surface-400 mt-1 font-medium">Supports PNG, JPG, JPEG, WEBP, AVIF up to 10MB</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing || !imageFile}
              className="w-full btn-saas-primary !py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              {analyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Scanning Plant Pathogens with AI...
                </>
              ) : (
                <>
                  <FaMicroscope /> Run AI Disease Diagnosis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Diagnosis Results */}
        <div className="space-y-6">
          {result ? (
            <div className="card-saas p-6 sm:p-8 space-y-6 border-brand-300 shadow-premium">
              <div className="flex items-start justify-between pb-4 border-b border-surface-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getSeverityBadge(result.severity)}`}>
                      Severity: {result.severity}
                    </span>
                    {result.crop && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-brand-900 border border-emerald-200">
                        {result.crop}
                      </span>
                    )}
                  </div>
                  <h3 className="section-heading text-lg sm:text-xl text-brand-950 font-display">
                    {result.disease}
                  </h3>
                  {result.pathogenType && (
                    <p className="text-xs text-surface-500 font-semibold mt-0.5">{result.pathogenType}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-surface-400 font-bold uppercase block">Confidence</span>
                  <span className="text-2xl font-black text-brand-800 font-display">
                    {Math.round((result.confidence || 0.9) * 100)}%
                  </span>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FaExclamationTriangle className="text-amber-500" /> Characteristic Symptoms
                </h4>
                <p className="text-xs text-surface-700 leading-relaxed bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                  {result.symptoms}
                </p>
              </div>

              {/* Chemical Treatment */}
              <div>
                <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FaShieldAlt className="text-brand-600" /> Recommended Fungicide / Treatment
                </h4>
                <p className="text-xs text-brand-950 font-medium leading-relaxed bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                  {result.treatment}
                </p>
              </div>

              {/* Organic Remedy */}
              {result.organicRemedy && (
                <div>
                  <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FaLeaf className="text-green-600" /> Certified Organic Remedy
                  </h4>
                  <p className="text-xs text-green-900 font-medium leading-relaxed bg-green-50 p-3.5 rounded-xl border border-green-200">
                    {result.organicRemedy}
                  </p>
                </div>
              )}

              {/* Engine Source & Expert CTA */}
              <div className="pt-4 border-t border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-surface-500 font-semibold">
                  Diagnostic Engine: <strong>{result.engine || 'Plant Pathology AI'}</strong>
                </span>
                <Link
                  to="/experts"
                  className="btn-saas-secondary text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <FaComments className="text-brand-700" /> Talk to Specialist
                </Link>
              </div>
            </div>
          ) : (
            <div className="card-saas p-8 text-center h-full flex flex-col items-center justify-center text-surface-400">
              <FaLeaf className="text-5xl text-emerald-200 mb-3" />
              <h3 className="card-heading text-base text-surface-700 mb-1 font-display">Diagnostic Report Ready</h3>
              <p className="text-xs max-w-xs leading-relaxed text-surface-500">
                Upload an affected leaf photo on the left and tap scan to view real-time disease identification and remedy protocols.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
