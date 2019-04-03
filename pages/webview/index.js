const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onLoad (options) {
    const event = decodeURIComponent(options.event)
    console.log(event)
    try {
      const code = await app.getCode()
      const server = app.getServer()
      this.setData({
        page: `https://${server}/baoming?event=${encodeURIComponent(event)}&code=${code}`
      })
    } catch(err) {
      app.alert(err)
    }
  },
})