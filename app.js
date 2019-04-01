const regeneratorRuntime = require("./pages/common/runtime")
App({
  
  globalData: {
    server: ''
  },

  onLaunch: function () {
    wx.cloud.init({
    })
  },

  async getServer() {
    if (this.globalData.server != '') {
      return this.globalData.server
    }
    try {
      const db = wx.cloud.database()
      const res = await db.collection('dns').get()
      const domain = res.data[0].domain
      this.setServer(domain)
      return domain
    } catch(err) {
      throw '网络异常'
    }
  },

  setServer(server) {
    this.globalData.server = server
  },

  getCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject('登录失败！' + res.errMsg)
          }
        }
      })
    })
  },

  async getEvents() {
    const server = await this.getServer()
    const url = `https://${server}/get-events`
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        header: {
          'content-type': 'application/json'
        },
        success: res => {
          if (res.statusCode == 200) {
            resolve(res.data)
          } else {
            reject(res.errMsg)
          }
        },
        fail: err => {
          reject('网络异常')
        }
      })
    })
  },

  alert(content) {
    wx.showModal({
      content: content,
      confirmColor: 'orange',
      confirmText: '知道了',
      showCancel: false
    })
  }
})
