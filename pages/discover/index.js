const regeneratorRuntime = require("../common/runtime")
const { TabPage } = require('../common/common')
const app = getApp()

TabPage({

  /**
   * 页面的初始数据
   */
  data: {
    albums: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    try {
      wx.showNavigationBarLoading()
      const db = wx.cloud.database();
      let isAdmin = wx.getStorageSync('isAdmin')
      if (isAdmin == '') {
        let res = await wx.cloud.callFunction({ name: 'login' })
        const { openId } = res.result
        res = await db.collection('admin').where({
          admin: openId
        }).count()
        if (res.total > 0) {
          isAdmin = 'yes'
        } else {
          isAdmin = 'no'
        }
        wx.setStorageSync('isAdmin', isAdmin)
      }
      
      const res = await db.collection('album').limit(10).field({
        detail: false
      }).get()
      this.setData({
        albums: res.data,
        admin: isAdmin == 'yes' ? true : false
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
      const res = await db.collection('album').skip(albums.length).limit(10).field({
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
  switchToAdmin() {
    wx.reLaunch({
      url: '../admin/index',
    })
  }
})