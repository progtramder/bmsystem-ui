const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onLoad (options) {
    const event = options.event
    try {
      const code = await app.getCode()
      const server = await app.getServer()
      this.setData({
        page: `https://${server}/baoming?event=${encodeURIComponent(event)}&code=${code}`
      })
    } catch(err) {
      console.log(err)
      app.alert(err)
    }
  },
})