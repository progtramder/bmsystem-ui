const regeneratorRuntime = require("../common/runtime");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  async accept() {
    try {
      wx.showLoading()
      let res = await wx.cloud.callFunction({ name: 'login' })
      const { openId } = res.result
      const db = wx.cloud.database()
      res = await db.collection('admin').where({
        admin: openId
      }).count()
      if (res.total = 0) {
        await db.collection('admin').add({
          data: {
            admin: openId
          }
        })
      }
      wx.setStorageSync('isAdmin', 'yes')
      wx.reLaunch({
        url: '/pages/admin/index',
      })
    } finally {
      wx.hideLoading()
    }
  }
})