const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    direction: 0,
    pivot: 1,
    selections: [
      '身份证',
      '护照',
      '台胞证',
      '回乡证',
      '澳门护照',
    ],
    disabled: [
      false,
      true,
      true,
      false,
      true
    ]
  },

  goHome() {
    wx.switchTab({
      url: '../discover/index'
    })
  },
  selectionTouchStart(e) {
    //停止所有惯性运动的timer, 如果有的话
    clearInterval(this.timerId)

    //保存当前位置等信息,以便计算方向, 速度
    this.clientY = e.changedTouches[0].clientY
    this.timeStamp = e.timeStamp
    this.identifier = e.changedTouches[0].identifier
    this.setData({
      tranTime: 0
    })
  },
  selectionTouchMove(e) {
    if (this.identifier != e.changedTouches[0].identifier) {
      return
    }
    const clientY = e.changedTouches[0].clientY
    const dist = this.data.ratioPixel * Math.abs(clientY - this.clientY)
    const timeStamp = e.timeStamp
    const direction = clientY - this.clientY
    const velocity = Math.round(dist / (timeStamp - this.timeStamp))
    this.clientY = clientY
    this.timeStamp = timeStamp
    this.velocity = velocity
    this.setData({
      direction
    })
   

    if (direction > 0) {
      this.rollDown(dist)
    } else (
      this.rollUp(dist)
    )
  },

  locate(tranTime) {
    //根据当前基准线的角度进行选项定位
    let pivot
    if (this.data.pivot < 0) {
      pivot = 0
    } else if (this.data.pivot > (this.data.selections.length - 1) * this.data.baseAngle) {
      pivot = (this.data.selections.length - 1) * this.data.baseAngle
    } else {
      pivot = Math.round(this.data.pivot / this.data.baseAngle) * this.data.baseAngle
    }

    this.setData({
      pivot,
      tranTime: tranTime //过度时间
    })
  },

  selectionTouchEnd(e) {
    if (this.identifier != e.changedTouches[0].identifier) {
      return
    }

    if (this.velocity == 0) {
      //定位给予0.5秒过度时间
      this.locate(0.5)
    } else {
      //惯性运动
      let velocity = this.velocity > 10 ? 10 : this.velocity
      const direction = this.data.direction
      const inertial = () => {
        if (velocity == 0) {
          //停止所有惯性运动的timer
          clearInterval(this.timerId)
          //惯性运动停止后需要定位选项的位置
          this.locate(0.5)
          return
        }
        const dist = velocity * 30
        if (direction > 0) {
          this.rollDown(dist)
        } else {
          this.rollUp(dist)
        }
        velocity--
      }
      this.timerId = setInterval(inertial, 20)
    }
  },
  closeWindow() {
    this.setData({
      showWindow: false
    })
  },
  showWindow() {
    this.setData({
      showWindow: true
    })
  },
  confirm() {
    this.setData({
      selected: this.data.selections[this.data.pivot / this.data.baseAngle]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const res = wx.getSystemInfoSync()
    const baseAngle = 30
    this.setData({
      comfirmColor: '#0C6BFE',
      pivot: 0, //转轴的角度
      baseAngle,
      //基本转角所对的弦长为100rpx
      baseY: 50 / Math.tan((baseAngle / 2)  * Math.PI / 180),
      perimeter: 360 * 100 / baseAngle,
      ratioPixel: 750 / res.windowWidth
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const res = wx.getSystemInfoSync()
    const winHeight = 750 * res.windowHeight / res.windowWidth
    this.setData({
      winHeight
    })
  },

  rollUp(dist, v) {
    let damping = 1
    if (this.data.pivot > (this.data.selections.length - 1) * this.data.baseAngle) {
      damping /= this.data.pivot - (this.data.selections.length - 1) * this.data.baseAngle
      damping *= 5
    }
    const pivot = this.data.pivot + damping * dist * 360 / this.data.perimeter
    this.setData({
      pivot: pivot >= 255 ? 255 : pivot //保留15度余量
    })
  },
  rollDown(dist, v) {
    let damping = 1
    if (this.data.pivot < 0) {
      damping /= Math.abs(this.data.pivot)
      damping *= 5
    }
    const pivot = this.data.pivot - damping * dist * 360 / this.data.perimeter
    this.setData({
      pivot: pivot <= -75 ? -75 : pivot  //保留15度余量
    })
  }
})