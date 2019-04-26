App({
  
  globalData: {
    server: 'lingying.mynatapp.cc'//'xsj.chneic.sh.cn'
  },

  getServer() {
    return this.globalData.server
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

  getEvents(school) {
    const server = this.getServer()
    const url = `https://${server}/get-events?school=${school}`
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
      confirmColor: '#FFA500',
      confirmText: '知道了',
      showCancel: false
    })
  }
})
