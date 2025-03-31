import c from 'ansi-colors'
import log from 'fancy-log'
import fs from 'fs'
import globule from 'globule'
import path from 'path'

class ImageFormatConverter {
  constructor(options = {}) {
    this.srcBase = options.srcBase || 'src'
    this.destBase = options.destBase || 'dist'
    this.includeExtensionName = options.includeExtensionName || false
    this.srcImages = [
      `${this.srcBase}/public/**/*.{webp,avif,svg,mp4}`,
      `${this.srcBase}/assets/**/*.{webp,avif,svg,mp4}`
    ]
    this.init()
  }

  init = async () => {
    const imagePathList = this.findImagePaths()
    await this.copyImages(imagePathList)
  }

  /**
   * globパターンで指定した画像パスを配列化して返す
   * @return { array } 画像パスの配列
   */
  findImagePaths = () => {
    return globule.find({ src: this.srcImages })
  }

  /**
   * 画像をdistにコピーする
   * @param { string } imagePath 画像パス
   */
  copyImage = async (imagePath) => {
    let destPath
    if (imagePath.includes('/public/')) {
      destPath = imagePath.replace(`${this.srcBase}/public`, `${this.destBase}`)
    } else {
      const regex = new RegExp(`${this.srcBase}/assets/(.*)\\.(webp|avif|svg|mp4)$`)
      const match = imagePath.match(regex)
      if (match) {
        destPath = path.join(this.destBase, 'assets', match[1] + '.' + match[2])
      }
    }
    
    if (destPath) {
      const destDir = path.dirname(destPath)

      if (!fs.existsSync(destDir)) {
        try {
          fs.mkdirSync(destDir, { recursive: true })
          log(`Created directory ${c.green(destDir)}`)
        } catch (err) {
          log(`Failed to create directory ${c.green(destDir)}\n${err}`)
        }
      }

      fs.copyFileSync(imagePath, destPath)
      log(`Copied ${c.blue(imagePath)} to ${c.green(destPath)}`)
    }
  }

  /**
   * 配列内の画像パスのファイルをdistにコピーする
   * @param { array } imagePathList 画像パスの配列
   */
  copyImages = async (imagePathList) => {
    if (imagePathList.length === 0) {
      log(c.red('No images found to copy'))
      return
    }

    for (const imagePath of imagePathList) {
      await this.copyImage(imagePath)
    }
  }
}

const imageFormatConverter = new ImageFormatConverter()