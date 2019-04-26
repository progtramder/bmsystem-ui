const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onLoad(options) {
    let school = options.school ? decodeURIComponent(options.school) : ''
    if (!school) {
      school = '领英系统'
    }
    wx.setNavigationBarTitle({
      title: school,
    })
    try {
      wx.showNavigationBarLoading()
      const events = await app.getEvents(school)
      this.setData({
        school,
        eventList: events.data
      })
    } catch(err) {
      app.alert(err)
    } finally {
      wx.hideNavigationBarLoading()
    }
  }
})