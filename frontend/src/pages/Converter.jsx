import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { FORMAT_CATEGORIES, getCategoryForFormat, getColorClass } from '../utils/formatMap'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  Upload, X, ChevronDown, ArrowRight, Download,
  CheckCircle2, AlertCircle, Loader2, Crown, Zap,
  FileText, RefreshCw
} from 'lucide-react'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function Converter() {
  const [searchParams] = useSearchParams()
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [fromFormat, setFromFormat] = useState(searchParams.get('from') || '')
  const [toFormat, setToFormat] = useState(searchParams.get('to') || '')
  const [toOptions, setToOptions] = useState([])
  const [status, setStatus] = useState('idle') // idle|uploading|converting|done|error
  const [progress, setProgress] = useState(0)
  const [conversionId, setConversionId] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState(null)

  // Update toOptions when fromFormat changes
  useEffect(() => {
    if (!fromFormat) return setToOptions([])
    const cat = getCategoryForFormat(fromFormat)
    if (!cat) return setToOptions([])
    const pairs = FORMAT_CATEGORIES[cat]?.pairs || []
    const opts = pairs.filter(([f]) => f === fromFormat).map(([, t]) => t)
    setToOptions(opts)
    if (!opts.includes(toFormat)) setToFormat(opts[0] || '')
  }, [fromFormat])

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('File too large or type not supported (max 50MB)')
      return
    }
    const f = accepted[0]
    setFile(f)
    setStatus('idle')
    setError(null)
    setDownloadUrl(null)
    // Auto-detect format from extension
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext) setFromFormat(ext)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  const handleConvert = async () => {
    if (!file) return toast.error('Please select a file')
    if (!toFormat) return toast.error('Please select target format')

    // Check quota
    if (user.plan === 'free' && user.conversionsUsed >= 5) {
      toast.error('Free limit reached. Upgrade to continue.')
      navigate('/pricing')
      return
    }

    setStatus('uploading')
    setProgress(10)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetFormat', toFormat)

    try {
      setProgress(30)
      const res = await api.post('/convert/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(30 + Math.round((e.loaded / e.total) * 30)),
      })

      setConversionId(res.data.conversionId)
      setStatus('converting')
      setProgress(65)

      // Poll status
      await pollStatus(res.data.conversionId)
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.message || 'Conversion failed')
      toast.error('Conversion failed')
    }
  }

  const pollStatus = async (id) => {
    let attempts = 0
    const maxAttempts = 60

    while (attempts < maxAttempts) {
      try {
        const res = await api.get(`/convert/status/${id}`)
        const { status: s, downloadUrl: url } = res.data

        if (s === 'done') {
          setStatus('done')
          setProgress(100)
          setDownloadUrl(url)
          updateUser({ conversionsUsed: (user.conversionsUsed || 0) + 1 })
          toast.success('File converted successfully!')
          return
        }
        if (s === 'failed') {
          throw new Error(res.data.error || 'Conversion failed')
        }
        setProgress(prev => Math.min(95, prev + 2))
        await new Promise(r => setTimeout(r, 2000))
        attempts++
      } catch (err) {
        setStatus('error')
        setError(err.message || 'Conversion failed')
        return
      }
    }
    setStatus('error')
    setError('Conversion timed out')
  }

  const handleReset = () => {
    setFile(null)
    setStatus('idle')
    setProgress(0)
    setConversionId(null)
    setDownloadUrl(null)
    setError(null)
  }

  const allFormats = Object.values(FORMAT_CATEGORIES).flatMap(c => c.formats)

  const isLimitReached = user?.plan === 'free' && (user?.conversionsUsed || 0) >= 5

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Convert your file</h1>
          <p className="text-forge-muted font-body">
            Upload, choose format, download. That simple.
          </p>
          {/* Quota bar */}
          {user?.plan === 'free' && (
            <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 card rounded-xl">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${i < (user?.conversionsUsed || 0) ? 'bg-brand-500' : 'bg-forge-border'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-mono text-forge-muted">
                {user?.conversionsUsed || 0}/5 free used
              </span>
              {isLimitReached && (
                <button onClick={() => navigate('/pricing')} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                  <Crown size={12} />Upgrade
                </button>
              )}
            </div>
          )}
        </div>

        {isLimitReached ? (
          /* Upgrade prompt */
          <div className="card p-10 text-center border-brand-500/20">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
              <Crown size={28} className="text-brand-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Free limit reached</h2>
            <p className="text-forge-muted font-body mb-6">
              You've used all 5 free conversions. Upgrade to Premium for unlimited conversions.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/pricing')} className="btn-primary">
                Upgrade for ₹90/month <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Drop zone */}
            {status === 'idle' && (
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-brand-500 bg-brand-500/5'
                    : file
                    ? 'border-brand-500/50 bg-brand-500/5'
                    : 'border-forge-border hover:border-forge-muted'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText size={28} className="text-brand-400" />
                    </div>
                    <p className="font-body font-medium text-white">{file.name}</p>
                    <p className="text-sm text-forge-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      className="mt-3 text-xs text-forge-muted hover:text-rose-400 transition-colors flex items-center gap-1 mx-auto"
                    >
                      <X size={12} />Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-forge-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-forge-muted" />
                    </div>
                    <p className="font-body font-medium text-white mb-1">
                      {isDragActive ? 'Drop it here' : 'Drop your file here'}
                    </p>
                    <p className="text-sm text-forge-muted">or click to browse — max 50MB</p>
                  </div>
                )}
              </div>
            )}

            {/* Format selectors */}
            {(file || status !== 'idle') && status !== 'done' && (
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  {/* From format */}
                  <div className="flex-1">
                    <label className="label">From</label>
                    <div className="relative">
                      <select
                        value={fromFormat}
                        onChange={e => setFromFormat(e.target.value)}
                        className="input-field appearance-none pr-10 font-mono uppercase"
                        disabled={status !== 'idle'}
                      >
                        <option value="">Select format</option>
                        {allFormats.map(f => (
                          <option key={f} value={f}>{f.toUpperCase()}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-muted pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-6">
                    <ArrowRight size={20} className="text-forge-muted" />
                  </div>

                  {/* To format */}
                  <div className="flex-1">
                    <label className="label">To</label>
                    <div className="relative">
                      <select
                        value={toFormat}
                        onChange={e => setToFormat(e.target.value)}
                        className="input-field appearance-none pr-10 font-mono uppercase"
                        disabled={!fromFormat || status !== 'idle'}
                      >
                        <option value="">Select format</option>
                        {toOptions.map(f => (
                          <option key={f} value={f}>{f.toUpperCase()}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-forge-muted pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status & progress */}
            {(status === 'uploading' || status === 'converting') && (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 size={18} className="text-brand-400 animate-spin" />
                  <span className="font-body font-medium text-white">
                    {status === 'uploading' ? 'Uploading...' : 'Converting...'}
                  </span>
                  <span className="font-mono text-sm text-forge-muted ml-auto">{progress}%</span>
                </div>
                <div className="h-2 bg-forge-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full progress-animated transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-forge-muted mt-3 font-body">
                  {status === 'uploading' ? 'Scanning for viruses and uploading...' : 'Running conversion engine...'}
                </p>
              </div>
            )}

            {/* Success */}
            {status === 'done' && downloadUrl && (
              <div className="card p-8 text-center border-emerald-500/20">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Conversion complete!</h3>
                <p className="text-forge-muted font-body text-sm mb-6">
                  Your file is ready. Download expires in 1 hour.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={downloadUrl}
                    download
                    className="btn-primary"
                  >
                    <Download size={16} />Download {toFormat.toUpperCase()}
                  </a>
                  <button onClick={handleReset} className="btn-secondary">
                    <RefreshCw size={16} />Convert another
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="card p-6 border-rose-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body font-medium text-white">Conversion failed</p>
                    <p className="text-sm text-forge-muted mt-1">{error}</p>
                    <button onClick={handleReset} className="mt-3 text-sm text-brand-400 hover:text-brand-300 font-medium">
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Convert button */}
            {file && toFormat && status === 'idle' && (
              <button
                onClick={handleConvert}
                className="btn-primary w-full justify-center py-4 text-base"
              >
                <Zap size={18} />
                Convert to {toFormat.toUpperCase()}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
