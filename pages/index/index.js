const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onLoad(options) {
    try {
      wx.showNavigationBarLoading()
      const events = await app.getEvents()
      this.setData({
        eventList: events.data
      })
    } catch(err) {
      app.alert(err)
    } finally {
      wx.hideNavigationBarLoading()
    }
  }
})