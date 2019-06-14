Page({
  switchToHome() {
    wx.switchTab({
      url: '../discover/index'
    })
  },

  onShareAppMessage(res) {
    return {
      title: '民办新世纪小学',
      path: '/pages/admin-enroll/index',
      imageUrl: '/image/invite.png'
    }
  }
})