const regeneratorRuntime = require("../common/runtime")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    albums: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onShow(options) {
    try {
      wx.showNavigationBarLoading()
      const db = wx.cloud.database();
      const res = await db.collection('album').orderBy('timeStamp', 'desc').limit(10).field({
        detail: false
      }).get()
      this.setData({
        albums: res.data
      })
    } finally {
      wx.hideNavigationBarLoading()
    }
  },
  async onReachBottom() {
    try {
      wx.showLoading()
      const db = wx.cloud.database();
      let albums = this.data.albums
      const res = await db.collection('album').orderBy('timeStamp', 'desc').skip(albums.length).limit(10).field({
        detail: false
      }).get()
      albums.push(...res.data)
      this.setData({
        albums
      })
    } finally {
      wx.hideLoading()
    }
  },
  createAlbum() {
    wx.navigateTo({
      url: '../album/index',
    })
  }
})