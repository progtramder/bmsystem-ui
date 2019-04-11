const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onLoad(options) {
    const event = decodeURIComponent(options.event)
    wx.setNavigationBarTitle({
      title: event,
    })

    try {
      wx.showNavigationBarLoading()
      const code = await app.getCode()
      let res = await app.getEventProfile(event, code)
      const openId = res.openid
      const poster = res.poster
      const form = res.form
      let userData = {}
      form.forEach((e) => {
        if (e.type == 'session') {
          userData.session = ''
        } else {
          userData[e.name] = ''
        }
      })
      res = await app.getStatus(event)
      const started = res.started
      const expired = res.expired
      const sessions = res.sessions
      let registered = false
      if (sessions.length == 1) {
        userData.session = 0
      }
      res = await app.getRegisterInfo(event, openId)
      if (res) {
        userData = res
        registered = true
      }
      this.setData({
        event,
        openId,
        poster,
        form,
        status: {
          started,
          expired,
          registered,
          sessions
        },
        userData
      })
      setInterval(this.updateStatus, 1000)
    } catch (err) {
      app.alert(err)
    } finally {
      wx.hideNavigationBarLoading()
    }
  },

  async updateStatus() {
    const res = await app.getStatus(this.data.event)
    const status = this.data.status
    status.started = res.started
    status.expired = res.expired
    status.sessions = res.sessions
    this.setData({
      status
    })
  },

  getInput(e) {
    const key = e.currentTarget.dataset.key
    const value = e.detail.value
    this.data.userData[key] = value
  },

  bindPickerChange(e) {
    const component = e.currentTarget.dataset.component
    const index = e.detail.value
    const userData = this.data.userData
    userData[component.name] = component.value[index]
    this.setData({
      userData
    })
  },
  bindSessionChange(e) {
    const index = e.detail.value
    const sessions = this.data.status.sessions
    if (sessions[index].number >= sessions[index].limit) {
      app.alert('该场次已报满')
      return
    }
    const userData = this.data.userData
    userData.session = index
    this.setData({
      userData
    })
  },
  submitBM() {
    const server = app.getServer()
    const event = this.data.event
    const openId = this.data.openId
    const url = `https://${server}/submit-baoming?event=${event}&openid=${openId}`
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'POST',
        data: this.data.userData,
        header: {
          'content-type': 'application/json'
        },
        success: res => {
          resolve(res.data)
        },
        fail: err => {
          reject('网络异常')
        }
      })
    })
  },

  formatAlertString(attr) {
    const form = this.data.form
    for (let i = 0; i < form.length; i++) {
      const component = form[i]
      if (attr == 'session' && component.type == 'session') {
        return '请选择' + component.name
      } else if (attr == component.name) {
        if (component.type == 'select') {
          return '请选择' + component.name 
        } 
        return '请输入' + component.name  
      }
    }
  },

  async handleSubmit() {
    let isFull = (sessions)=> {
      for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].number < sessions[i].limit) {
          return false
        }
      }
      return true
    }
    const status = this.data.status
    if (!status.started || status.expired || status.registered || isFull(status.sessions)) {
      return
    }

    const userData = this.data.userData
    for (let attr in userData) {
      if (userData[attr] === '') {
        app.alert(this.formatAlertString(attr))
        return
      }
    }
    try {
      const res = await this.submitBM()
      if (res.errCode == 0) {
        const status = this.data.status
        status.registered = true
        this.setData({
          status
        })
      }
      app.alert(res.errMsg)
      console.log(this.data)
    } catch (err) {
      app.alert(err)
    }
  }
})