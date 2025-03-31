import { defineConfig } from 'vite'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'

class ImageFormatConverter {
  constructor(options = {}) {
    this.srcBase = options.srcBase || 'src'
    this.imageFormats = options.imageFormats || [
      { type: 'avif', quality: 50 },
      { type: 'webp', quality: 80 }
    ]
    this.watcher = null
  }

  isImage(file) {
    return /\.(jpe?g|png)$/i.test(file)
  }

  convertImage(imagePath) {
    this.imageFormats.forEach((format) => {
      const extname = path.extname(imagePath)
      const filename = path.basename(imagePath, extname)
      const destPath = path.join(path.dirname(imagePath), `${filename}.${format.type}`)

      sharp(imagePath)
        .toFormat(format.type, { quality: format.quality })
        .toFile(destPath)
    })
  }

  renameConvertedImages(oldPath, newPath) {
    this.imageFormats.forEach((format) => {
      const oldExtname = path.extname(oldPath)
      const oldFilename = path.basename(oldPath, oldExtname)
      const oldConvertedPath = path.join(path.dirname(oldPath), `${oldFilename}.${format.type}`)

      const newExtname = path.extname(newPath)
      const newFilename = path.basename(newPath, newExtname)
      const newConvertedPath = path.join(path.dirname(newPath), `${newFilename}.${format.type}`)

      if (fs.existsSync(oldConvertedPath)) {
        fs.renameSync(oldConvertedPath, newConvertedPath)
      }
    })
  }

  startWatching() {
    if (this.watcher) return

    this.watcher = chokidar.watch(`${this.srcBase}/**/*.{jpg,jpeg,png}`, {
      ignoreInitial: false
    })

    this.watcher.on('add', (imagePath) => {
      this.convertImage(imagePath)
    })

    this.watcher.on('change', (imagePath) => {
      this.convertImage(imagePath)
    })

    this.watcher.on('unlink', (imagePath) => {
      this.imageFormats.forEach((format) => {
        const extname = path.extname(imagePath)
        const filename = path.basename(imagePath, extname)
        const convertedPath = path.join(path.dirname(imagePath), `${filename}.${format.type}`)

        if (fs.existsSync(convertedPath)) {
          fs.unlinkSync(convertedPath)
        }
      })
    })

    this.watcher.on('rename', (oldPath, newPath) => {
      if (this.isImage(oldPath) && this.isImage(newPath)) {
        this.renameConvertedImages(oldPath, newPath)
      }
    })
  }

  config() {
    return defineConfig({
      plugins: [
        {
          name: 'image-converter',
          buildStart: this.startWatching.bind(this),
        },
      ],
    })
  }
}

const imageFormatConverter = new ImageFormatConverter()
imageFormatConverter.startWatching()