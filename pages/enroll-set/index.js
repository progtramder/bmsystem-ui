const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  async onShow(options) {
    try {
      wx.showNavigationBarLoading()
      const events = await app.getEvents()
      this.setData({
        eventList: events.data ? events.data : []
      })
    } catch(err) {
      app.alert(err.errMsg)
    } finally {
      wx.hideNavigationBarLoading()
    }
  },

  enrollEdit(e) {
    this.setData({
      editingEventIndex: e.currentTarget.dataset.index,
      showModal: true
    })
  },
  closeModal() {
    this.setData({
      showModal: false
    })
  },
  async editEnroll() {
    try {
      wx.showLoading({
        title: '正在获取状态',
      })
      this.closeModal()
      const ok = await this.canEdit()
      const event = this.data.eventList[this.data.editingEventIndex]
      if (ok) {
        wx.navigateTo({
          url: `../enroll-edit/index?event=${event}&safe=yes`,
        })
      } else {
        wx.navigateTo({
          url: `../enroll-edit/index?event=${event}`,
        })
      }
    } catch (err) {
      console.log(err)
      app.alert(err.errMsg)
    } finally {
      wx.hideLoading()
    }
  },
  async canEdit() {
    const event = this.data.eventList[this.data.editingEventIndex]
    const res = await app.getStatus(event)
    const started = res.started
    const sessions = res.sessions
    let expired = true
    for (let i = 0; i < sessions.length; i++) {
      if (!sessions[i].expired) {
        expired = false
      }
    }
    return !started || expired
  },
  
  async deleteEnroll() {
    this.closeModal()
    try {
      wx.showLoading({
        title: '正在删除',
      })
      const ok = await this.canEdit()
      if (!ok) {
        app.alert('报名正在进行中, 不能删除哦')
        return
      }

      const code = await app.getCode()
      const eventList = this.data.eventList
      const event = eventList[this.data.editingEventIndex]
      await app.removeEvent(code, event)
      eventList.splice(this.data.editingEventIndex, 1)
      this.setData({
        eventList
      })
    } catch(err) {
      console.log(err)
      app.alert(err.errMsg)
    } finally {
      wx.hideLoading()
    }
  },

  async getQrCode() {
    this.closeModal()
    const eventList = this.data.eventList
    const event = eventList[this.data.editingEventIndex]
    const path = `pages/webview/index?event=${event}`
    try {
      wx.showLoading({
        title: '正在生成小程序码',
      })
      const res = await wx.cloud.callFunction({
        name: 'qrcode',
        data: {
          cloudPath: `qrcode/${event}.jpg`,
          path
        }
      })
      const { fileID: file } = res.result
      wx.previewImage({
        current: file,
        urls: [file]
      })
    } catch (err) {
      console.log(err)
      app.alert(err.errMsg)
    } finally {
      wx.hideLoading()
    }
  },

  createEnroll() {
    wx.navigateTo({
      url: '../enroll-edit/index',
    })
  }
})