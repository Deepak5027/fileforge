export const FORMAT_CATEGORIES = {
  document: {
    label: 'Documents',
    color: 'blue',
    icon: '📄',
    formats: ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'md', 'html', 'epub'],
    pairs: [
      ['pdf','docx'],['pdf','txt'],['docx','rtf'],['docx','odt'],
      ['html','pdf'],['epub','pdf'],['epub','txt'],['txt','md'],['md','txt'],
      ['docx','pdf'],['rtf','docx'],['odt','docx'],
    ]
  },
  image: {
    label: 'Images',
    color: 'purple',
    icon: '🖼️',
    formats: ['jpg','jpeg','png','webp','bmp','svg','tiff','gif'],
    pairs: [
      ['jpg','png'],['png','jpg'],['png','webp'],['jpg','webp'],
      ['jpg','bmp'],['svg','png'],['tiff','jpg'],['webp','jpg'],
      ['gif','png'],['png','gif'],
    ]
  },
  data: {
    label: 'Data',
    color: 'emerald',
    icon: '📊',
    formats: ['csv','json','xml','yaml','xlsx','xls'],
    pairs: [
      ['csv','json'],['json','csv'],['json','xml'],['xml','json'],
      ['xml','yaml'],['yaml','xml'],['csv','xlsx'],['xlsx','csv'],
    ]
  },
  audio: {
    label: 'Audio',
    color: 'amber',
    icon: '🎵',
    formats: ['mp3','wav','flac','aac','ogg','m4a'],
    pairs: [
      ['mp3','wav'],['wav','mp3'],['flac','mp3'],['aac','mp3'],
      ['ogg','mp3'],['m4a','mp3'],['wav','flac'],
    ]
  },
  video: {
    label: 'Video',
    color: 'rose',
    icon: '🎬',
    formats: ['mp4','avi','mov','mkv','webm','flv'],
    pairs: [
      ['mp4','avi'],['avi','mp4'],['mov','mp4'],['mkv','mp4'],
      ['webm','mp4'],['flv','mp4'],['mp4','webm'],
    ]
  }
}

export function getAllPairs() {
  return Object.values(FORMAT_CATEGORIES).flatMap(cat => cat.pairs)
}

export function searchFormats(query) {
  if (!query) return []
  const q = query.toLowerCase().replace(/\s+/g,'')
  const results = []
  for (const [cat, data] of Object.entries(FORMAT_CATEGORIES)) {
    for (const [from, to] of data.pairs) {
      const str = `${from}to${to}${from}${to}convertto`
      if (str.includes(q) || `${from}to${to}`.includes(q)) {
        results.push({ from, to, category: cat, label: data.label, color: data.color })
      }
    }
  }
  return results.slice(0, 8)
}

export function getCategoryForFormat(fmt) {
  for (const [cat, data] of Object.entries(FORMAT_CATEGORIES)) {
    if (data.formats.includes(fmt.toLowerCase())) return cat
  }
  return null
}

export function getColorClass(color) {
  const map = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }
  return map[color] || map.blue
}
