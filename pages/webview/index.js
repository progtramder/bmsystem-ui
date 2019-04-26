const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onLoad (options) {
    const school = decodeURIComponent(options.school)
    const event = decodeURIComponent(options.event)
    try {
      const code = await app.getCode()
      const server = app.getServer()
      this.setData({
        page: `https://${server}/baoming?school=${encodeURIComponent(school)}&event=${encodeURIComponent(event)}&code=${code}`
      })
    } catch(err) {
      app.alert(err)
    }
  },
})