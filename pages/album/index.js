const regeneratorRuntime = require("../common/runtime")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    albumId: '',
    cover: '',
    subject: '',
    brief: '',
    detail: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let title = "新建相册"
    if (options.id) {
      title = "相册编辑"
      this.setData({
        albumId: options.id
      })
      wx.showNavigationBarLoading()
      const db = wx.cloud.database();
      db.collection('album').where({
        _id: options.id
      }).get().then((res) => {
        wx.hideNavigationBarLoading()
        let album = res.data[0]
        this.selectComponent("#rich_editor").init(album.detail)
        this.setData({
          cover: album.cover,
          subject: album.subject,
          brief: album.brief,
          detail: album.detail
        })
      })
    }
    wx.setNavigationBarTitle({
      title
    })
  },

  addCover() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({
          cover: res.tempFilePaths[0]
        })
      },
    })
  },

  getSubject(e) {
    this.data.subject = e.detail.value
  },

  getBrief(e) {
    this.data.brief = e.detail.value
  },

  async saveAlbum() {
    if (this.data.cover == '') {
      app.alert('请选择一张封面图片')
      return
    } else if (this.data.subject == '') {
      app.alert('请填写主题内容')
      return
    }

    try {
      wx.showLoading({
        title: '正在上传',
      })
      const db = wx.cloud.database()
      let albumId = this.data.albumId
      if (albumId == '') {
        const res = await db.collection('album').add({
          data: {
          },
        })
        albumId = res._id
        this.setData({
          albumId: albumId
        })
      }

      const formatFilePath = (server, fileId) => {
        return `https://${server}/${fileId}`
      }
      //获取服务器上传token
      const code = await app.getCode()
      const server = app.getServer()
      let url = `https://${server}/save-album?code=${code}`
      const token = await this.getToken(url)
      url = `https://${server}/save-album?token=${token}`

      //上传封面
      if (!this.data.cover.match(/^https:\/\//)) {
        const fileId = await this.upload(url, this.data.cover)
        this.data.cover = formatFilePath(server, fileId)
      }

      //上传相册
      for (let index = 0; index < this.data.detail.length; index++) {
        const e = this.data.detail[index]
        if (!e.src.match(/^https:\/\//)) {
          const fileId = await this.upload(url, e.src)
          e.src = formatFilePath(server, fileId)
        }
      }
      await wx.cloud.callFunction({
        name: 'database',
        data: {
          func: 'dbupdate',
          collect: 'album',
          docId: albumId,
          data: {
            cover: this.data.cover,
            subject: this.data.subject,
            brief: this.data.brief,
            detail: this.data.detail
          }
        }
      })

      wx.navigateBack()
    } catch (err) {
      app.alert(`${err.errMsg} 请重试`)
      console.log(err)
    } finally {
      wx.hideLoading()
    }
  },

  async getToken(url) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        header: {
          'content-type': 'application/json'
        },
        success: res => {
          if (res.statusCode == 200) {
            resolve(res.data.token)
          } else {
            reject({ errMsg: `服务器返回错误: ${res.statusCode}` })
          }
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  upload(url, file) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: url,
        filePath: file,
        name: 'save-album',
        success: (res) => {
          if (res.statusCode == 200) {
            resolve(res.data)
          } else {
            reject({ errMsg: `服务器返回错误: ${res.statusCode}` })
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  addDetail(event) {
    let nodeList = event.detail
    this.setData({
      detail: nodeList
    })
  },

  deleteDetail(event) {
    const { nodeList, node } = event.detail
    this.setData({
      detail: nodeList
    })
  }
})