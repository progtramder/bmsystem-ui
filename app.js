App({
  
  globalData: {
    server: 'lingying.mynatapp.cc'//'xsj.chneic.sh.cn'
  },

  onLaunch(opts) {
    wx.cloud.init({
      env: 'mb-37a75a',
      traceUser: true,
    })
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
            reject({errMsg: '登录失败'})
          }
        }
      })
    })
  },

  request(url) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        success: res => {
          if (res.statusCode == 200) {
            resolve(res.data)
          } else {
            reject({ errMsg: `服务器返回错误: ${res.statusCode}`})
          }
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  post(url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'POST',
        data,
        success: res => {
          if (res.statusCode == 200) {
            resolve(res.data)
          } else {
            reject({ errMsg: `服务器返回错误: ${res.statusCode}` })
          }
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  getEvents() {
    const server = this.getServer()
    const url = `https://${server}/get-events`
    return this.request(url)
  },

  getEventProfile(event, code) {
    const server = this.getServer()
    const url = `https://${server}/event-profile?event=${event}&code=${code}`
    return this.request(url)
  },

  getStatus(event) {
    const server = this.getServer()
    const url = `https://${server}/status?event=${event}`
    return this.request(url)
  },

  startBaoming(code, event) {
    const server = this.getServer()
    const url = `https://${server}/start-baoming?code=${code}&event=${event}`
    return this.request(url)
  },

  getRegisterInfo(event, openId) {
    const server = this.getServer()
    const url = `https://${server}/register-info?event=${event}&openid=${openId}`
    return this.request(url)
  },

  getEventInformation(code, event) {
    const server = this.getServer()
    const url = `https://${server}/event-information?event=${event}&code=${code}`
    return this.request(url)
  },
  addEvent(code, eventObject) {
    const server = this.getServer()
    const url = `https://${server}/add-event?code=${code}`
    return this.post(url, eventObject)
  },

  editEvent(code, eventObject) {
    const server = this.getServer()
    const url = `https://${server}/edit-event?code=${code}`
    return this.post(url, eventObject)
  },

  removeEvent(code, event) {
    const server = this.getServer()
    const url = `https://${server}/remove-event?event=${event}&code=${code}`
    return this.request(url)
  },

  alert(content) {
    wx.showModal({
      content: content,
      confirmColor: '#F56C6C',
      confirmText: '知道了',
      showCancel: false
    })
  }
})
