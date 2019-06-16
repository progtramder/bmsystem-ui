const regeneratorRuntime = require("../common/runtime")
const { TabPage } = require('../common/common')
const app = getApp()
TabPage({
  async onLoad(options) {
    try {
      wx.showNavigationBarLoading()
      const events = await app.getEvents()
      this.setData({
        eventList: events.data ? events.data : []
      })
    } finally {
      wx.hideNavigationBarLoading()
    }
  }
})