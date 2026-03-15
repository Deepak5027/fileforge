const express = require('express')
const router = express.Router()
const multer = require('multer')
const axios = require('axios')
const FormData = require('form-data')
const { authMiddleware, planMiddleware } = require('../middleware/auth.middleware')
const Conversion = require('../models/Conversion.model')
const User = require('../models/User.model')

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    // Accept all common file types
    cb(null, true)
  }
})

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000'

// POST /api/convert/upload
router.post('/upload', authMiddleware, planMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const { targetFormat } = req.body
    if (!targetFormat) return res.status(400).json({ message: 'Target format required' })

    const originalExt = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin'

    // Create DB record
    const conversion = await Conversion.create({
      userId: req.user._id,
      originalFileName: req.file.originalname,
      originalFormat: originalExt,
      targetFormat: targetFormat.toLowerCase(),
      fileSize: req.file.size,
      status: 'pending',
    })

    // Forward to Python service async
    const form = new FormData()
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })
    form.append('targetFormat', targetFormat.toLowerCase())
    form.append('conversionId', conversion._id.toString())

    // Fire and forget — Python service updates DB directly
    axios.post(`${PYTHON_API}/convert/process`, form, {
      headers: form.getHeaders(),
      maxContentLength: MAX_SIZE,
      timeout: 300000,
    }).then(async (pyRes) => {
      await Conversion.findByIdAndUpdate(conversion._id, {
        status: 'done',
        downloadUrl: pyRes.data.downloadUrl,
        storagePath: pyRes.data.storagePath,
      })
      // Increment user conversion count
      await User.findByIdAndUpdate(req.user._id, { $inc: { conversionsUsed: 1 } })
    }).catch(async (err) => {
      await Conversion.findByIdAndUpdate(conversion._id, {
        status: 'failed',
        error: err.response?.data?.detail || err.message,
      })
    })

    res.json({ conversionId: conversion._id, status: 'pending' })
  } catch (err) {
    console.error(err)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File too large (max 50MB)' })
    }
    res.status(500).json({ message: 'Upload failed' })
  }
})

// GET /api/convert/status/:id
router.get('/status/:id', authMiddleware, async (req, res) => {
  try {
    const conversion = await Conversion.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
    if (!conversion) return res.status(404).json({ message: 'Conversion not found' })

    res.json({
      status: conversion.status,
      downloadUrl: conversion.downloadUrl,
      error: conversion.error,
    })
  } catch {
    res.status(500).json({ message: 'Status check failed' })
  }
})

// GET /api/convert/formats
router.get('/formats', (_req, res) => {
  const formats = {
    document: {
      formats: ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'md', 'html', 'epub'],
      pairs: [['pdf','docx'],['pdf','txt'],['docx','rtf'],['docx','odt'],['html','pdf'],['epub','pdf'],['epub','txt'],['txt','md'],['docx','pdf']]
    },
    image: {
      formats: ['jpg','jpeg','png','webp','bmp','svg','tiff','gif'],
      pairs: [['jpg','png'],['png','jpg'],['png','webp'],['jpg','webp'],['jpg','bmp'],['svg','png'],['tiff','jpg'],['webp','jpg']]
    },
    data: {
      formats: ['csv','json','xml','yaml','xlsx'],
      pairs: [['csv','json'],['json','csv'],['json','xml'],['xml','json'],['xml','yaml'],['yaml','xml'],['csv','xlsx'],['xlsx','csv']]
    },
    audio: {
      formats: ['mp3','wav','flac','aac','ogg','m4a'],
      pairs: [['mp3','wav'],['wav','mp3'],['flac','mp3'],['aac','mp3'],['ogg','mp3']]
    },
    video: {
      formats: ['mp4','avi','mov','mkv','webm'],
      pairs: [['mp4','avi'],['avi','mp4'],['mov','mp4'],['mkv','mp4'],['webm','mp4']]
    }
  }
  res.json(formats)
})

// GET /api/convert/search
router.get('/search', (_req, res) => {
  const { q } = _req.query
  if (!q) return res.json([])

  const query = q.toLowerCase().replace(/\s+/g, '')
  const all = [
    ...['pdf','docx','txt','rtf','odt','md','html','epub'].flatMap(f =>
      ['pdf','docx','txt','rtf','odt','md','html','epub'].filter(t => t !== f).map(t => ({ from: f, to: t, category: 'document' }))
    ),
    ...['jpg','png','webp','bmp','svg','tiff'].flatMap(f =>
      ['jpg','png','webp','bmp','svg','tiff'].filter(t => t !== f).map(t => ({ from: f, to: t, category: 'image' }))
    ),
  ]

  const results = all.filter(({ from, to }) =>
    `${from}to${to}`.includes(query) || `${from}${to}`.includes(query)
  ).slice(0, 8)

  res.json(results)
})

module.exports = router
