const app = getApp()

Component({

  properties: {
    text: {
      type: String,
      value: 'Wechat'
    },
    back: {
      type: Boolean,
      value: false
    },
    home: {
      type: Boolean,
      value: false
    },
    windowColor: {
      type: String,
      value: '#FBFBFB'
    },
    background: {
      type: String,
      value: '#F6F6F6'
    }
  },
  data: {
    statusBarHeight: 0,
    navigationBarHeight: 0
  },

  attached: function () {
    const { statusBarHeight } = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight,
      navigationBarHeight: statusBarHeight + 44,
    })
  },

  methods: {
    backHome: function () {
      this.triggerEvent("backhome");
    },
    back: function () {
      wx.navigateBack({
        delta: 1
      })
    }
  }
})