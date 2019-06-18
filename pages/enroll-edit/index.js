const regeneratorRuntime = require("../common/runtime")
const app = getApp()
Page({
  data: {
    safeMode: true,
    editMode: false,
    unsafeModeSessions: [], //在报名进行时的非安全模式下只可以在尾部添加session
    poster: '',
    eventObject: {
      event: '',
      poster: '',
      sessions: [],
      form: []
    }
  },
  async onLoad(options) {
    const title = options.event ? '报名编辑' : '新建报名'
    wx.setNavigationBarTitle({
      title: title,
    })
    if (options.event) {
      try {
        wx.showNavigationBarLoading()
        const code = await app.getCode()
        let res = await app.getEventInformation(code, options.event)
        const poster = this.formatPosterUrl(res.poster)
        this.setData({
          editMode: true,
          safeMode: options.safe ? true : false,
          poster,
          eventObject: res
        })
      } catch(err) {
        console.log(err)
        app.alert(err.errMsg)
      }finally {
        wx.hideNavigationBarLoading()
      } 
    }
  },
  formatPosterUrl(file) {
    const server = app.getServer()
    return file == '' ? '' : `https://${server}/image/${file}`
  },
  addPoster() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({
          poster: res.tempFilePaths[0]
        })
      },
    })
  },
  deletePoster() {
    this.setData({
      poster: ''
    })
  },
  getEventName(e) {
    this.data.eventObject.event = e.detail.value
  },

  showSessionAdd() {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    this.setData({
      timeBaseStart: `${year}-${month}-${day}`,
      timeBaseEnd: `${year + 1}-${month}-${day}`,
      showSessionAdd: true
    })
  },
  bindDateChange(e) {
    this.setData({
      sessionDate: e.detail.value
    })
  },
  bindTimeChange(e) {
    this.setData({
      sessionTime: e.detail.value
    })
  },
  getSessionLimit(e) {
    this.data.sessionLimit = e.detail.value
  },
  formatDT(date, time){
    const dArray = date.split('-')
    const tArray = time.split(':')
    if (Number(tArray[0]) < 12) {
      return `${dArray[0]}年${dArray[1]}月${dArray[2]}日 上午${time}`
    } else {
      return `${dArray[0]}年${dArray[1]}月${dArray[2]}日 下午${time}`
    }
  },

  addSession() {
    if (!this.data.sessionDate) {
      app.alert('请选择日期')
      return
    }
    if (!this.data.sessionTime) {
      app.alert('请选择时间')
      return
    }

    const sessionLimit = Number(this.data.sessionLimit)
    if (!sessionLimit || sessionLimit <= 0) {
      app.alert('人数限制必须大于0')
      return
    }
    
    if (this.data.safeMode) {
      const eventObject = this.data.eventObject
      eventObject.sessions.push({
        description: this.formatDT(this.data.sessionDate, this.data.sessionTime),
        endtime: `${this.data.sessionDate} ${this.data.sessionTime}`,
        limit: sessionLimit
      })
      this.setData({
        eventObject
      })
    } else {
      const unsafeModeSessions = this.data.unsafeModeSessions
      unsafeModeSessions.push({
        description: this.formatDT(this.data.sessionDate, this.data.sessionTime),
        endtime: `${this.data.sessionDate} ${this.data.sessionTime}`,
        limit: sessionLimit
      })
      this.setData({
        unsafeModeSessions
      })
    }
    
    this.closePopupWindow()
  },
  showSessionUpdate(e) {
    //为了简化交互，在安全模式下因为可以删除session，所以不提供编辑功能
    if (this.data.safeMode) {
      return
    }
    const index = e.currentTarget.dataset.index
    this.setData({
      editingSession: index,
      showSessionUpdate: true
    })
  },
  updateSession(e) {
    const eventObject = this.data.eventObject
    const index = this.data.editingSession
    const sessionLimit = Number(this.data.sessionLimit)
    if (!sessionLimit || sessionLimit < eventObject.sessions[index].limit) {
      app.alert('新的人数限制不能小于原有人数限制')
      return
    }

    eventObject.sessions[index].limit = sessionLimit
    this.setData({
      eventObject
    })
    this.closePopupWindow()
  },
  deleteSession(e) {
    const index = e.currentTarget.dataset.index
    const eventObject = this.data.eventObject
    eventObject.sessions.splice(index, 1)
    this.setData({
      eventObject
    })
  },
  deleteUnsafeModeSession(e) {
    const index = e.currentTarget.dataset.index
    const unsafeModeSessions = this.data.unsafeModeSessions
    unsafeModeSessions.splice(index, 1)
    this.setData({
      unsafeModeSessions
    })
  },
  addForm() {
    this.setData({
      showMask: true
    })
  },
  deleteForm(e) {
    const index = e.currentTarget.dataset.index
    const eventObject = this.data.eventObject
    eventObject.form.splice(index, 1)
    this.setData({
      eventObject
    })
  },
  popFormInput() {
    this.closeMask()
    this.setData({
      showFormInput: true
    })
  },
  popFormSelect() {
    this.closeMask()
    this.setData({
      showFormSelect: true
    })
  },
  popFormSession() {
    this.closeMask()
    let found = false
    const eventObject = this.data.eventObject
    eventObject.form.forEach(e => {
      if (e.type == 'session') {
        found = true
      }
    })
    if (found) {
      app.alert('场次控件只能有一个')
      return
    }

    this.setData({
      showFormSession: true
    })
  },

  addFormInput() {
    if (!this.data.formInputName) {
      app.alert('输入控件名称不能为空')
      return
    }
    const eventObject = this.data.eventObject
    eventObject.form.push({ name: this.data.formInputName, type: 'text'})
    this.setData({
      eventObject
    })
    this.closePopupWindow()
  },

  formOptionAdd() {
    const formOptions = this.data.formOptions || []
    formOptions.push('')
    this.setData({
      formOptions
    })
  },
  getFormOption(e) {
    const index = e.currentTarget.dataset.index
    const formOptions = this.data.formOptions
    formOptions[index] = e.detail.value
  },
  deleteFormOption(e) {
    const index = e.currentTarget.dataset.index
    const formOptions = this.data.formOptions
    formOptions.splice(index, 1)
    this.setData({
      formOptions
    })
  },
  addFormSelect() {
    if (!this.data.formSelectName) {
      app.alert('选择控件名称不能为空')
      return
    }
    const formOptions = this.data.formOptions
    //拷贝所有的选项
    const options = []
    let optionEmpty = false
    formOptions.forEach(e => {
      options.push(e)
      if (e == '') {
        optionEmpty = true
        return
      }
    })
    if (formOptions == 0 || optionEmpty) {
      app.alert('选项不能为空')
      return
    }

    const eventObject = this.data.eventObject
    eventObject.form.push({ name: this.data.formSelectName, type: 'select', value: options })
    this.setData({
      eventObject
    })
    this.closePopupWindow()
  },
  addFormSession() {
    if (!this.data.formSessionName) {
      app.alert('场次控件名称不能为空')
      return
    }

    const eventObject = this.data.eventObject
    eventObject.form.push({ name: this.data.formSessionName, type: 'session' })
    this.setData({
      eventObject
    })
    this.closePopupWindow()
  },

  closePopupWindow() {
    this.setData({
      sessionDate: '',
      sessionTime: '',
      sessionLimit: '',
      formInputName: '',
      formSelectName: '',
      formSessionName: '',
      formOptions: [],
      showSessionAdd: false,
      showSessionUpdate: false,
      showFormInput: false,
      showFormSession: false,
      showFormSelect: false
    })
  },

  getFormInputName(e) {
    this.data.formInputName = e.detail.value
  },
  getFormSelectName(e) {
    this.data.formSelectName = e.detail.value
  },
  getFormSessionName(e) {
    this.data.formSessionName = e.detail.value
  },

  upload(url, file) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: url,
        filePath: file,
        name: 'save-poster',
        success: (res) => {
          if (res.statusCode == 200) {
            resolve(res.data)
          } else {
            reject({ errMsg: `服务器返回错误: ${res.statusCode}` })
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  async addEnroll() {
    const eventObject = this.data.eventObject
    if (eventObject.event == '') {
      app.alert('请输入报名主题')
      return
    }
    if (eventObject.sessions.length == 0) {
      app.alert('请添加报名场次')
      return
    }
    if (eventObject.form.length == 0) {
      app.alert('请添加用户界面')
      return
    }

    //在非safe模式下尾部添加新的session
    eventObject.sessions.push(...this.data.unsafeModeSessions)

    try {
      wx.showLoading({
        title: '正在保存',
      })
      //上传海报，如果是图片是新加的
      if (this.data.poster == '') {
        this.setData({
          'eventObject.poster': ''
        })
      } else if (!this.data.poster.match(/^https:\/\//)) {
        let code = await app.getCode()
        const server = app.getServer()
        let url = `https://${server}/save-poster?code=${code}`
        const fileId = await this.upload(url, this.data.poster)
        this.setData ({
          poster: this.formatPosterUrl(fileId),
          'eventObject.poster': fileId
        })
      }

      const code = await app.getCode()
      if (this.data.editMode) {
        await app.editEvent(code, this.data.eventObject)
      } else {
        await app.addEvent(code, this.data.eventObject)
      }
      wx.navigateBack()
    } catch (err) {
      //在异常情况下删除非安全模式下并入的session
      for (let i = 0; i < this.data.unsafeModeSessions.length; i++) {
        eventObject.sessions.pop()
      }
      console.log(err)
      app.alert(err.errMsg)
    } finally {
      wx.hideLoading()
    }
  },

  closeMask() {
    this.setData({
      showMask: false
    })
  }
})