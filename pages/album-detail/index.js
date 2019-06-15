const regeneratorRuntime = require("../common/runtime")
const app = getApp()

Page({
  async onLoad(options) {
    try {
      wx.showNavigationBarLoading()
      const db = wx.cloud.database();
      const res = await db.collection('album').where({
        _id: options.id
      }).get()
      let album = res.data[0]
      wx.setNavigationBarTitle({
        title: album.subject
      })
      this.setData({
        album
      })
    } finally {
      wx.hideNavigationBarLoading()
    }
  },
  imageTap(e) {
    let paths = []
    this.data.album.detail.forEach(e => {
      if (e.type == 'image') {
        paths.push(e.src)
      }
    })
    wx.previewImage({
      urls: paths,
      current: e.currentTarget.dataset.imgpath
    })
  },

  coverTap() {
    console.log(this.data.cover)
    wx.previewImage({
      urls: [this.data.album.cover],
      current: this.data.album.cover
    })
  }
})