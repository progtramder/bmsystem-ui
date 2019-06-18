const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onLoad(options) {
    wx.setNavigationBarTitle({
      title: options.event,
    })
    this.setData({
      event: options.event
    })

    try {
      wx.showNavigationBarLoading()
      await this.updateStatus()
      this.timeId = setInterval(this.updateStatus, 1000)
    } catch (err) {
      app.alert(err.errMsg)
      console.log(err)
    } finally {
      wx.hideNavigationBarLoading()
    }
  },
  onUnload() {
    clearInterval(this.timeId)
  },
  async updateStatus() {
    const res = await app.getStatus(this.data.event)
    const started = res.started
    const sessions = res.sessions
    let expired = true
    for (let i = 0; i < sessions.length; i++) {
      if (!sessions[i].expired) {
        expired = false
      }
    }
    this.setData({
      started,
      expired,
      sessions
    })
  },
  async handleStart() {
    try {
      const code = await app.getCode()
      await app.startBaoming(code, this.data.event)
      this.setData({
        started: true
      })
    } catch(err) {
      app.alert(err.errMsg)
    }
  },
})