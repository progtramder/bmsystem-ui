const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      event: options.event
    })
  },

  viewDocument() {
    const url = `https://${app.getServer()}/report/${this.data.event}.xlsx`
    wx.showLoading({
      title: '正在下载文件',
    })
    wx.downloadFile({
      url,
      success: function (res) {
        wx.openDocument({
          filePath: res.tempFilePath,
        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },

  copyLink() {
    const link = `https://${app.getServer()}/report/${this.data.event}.xlsx`
    wx.setClipboardData({
      data: link,
      success(res) {
        wx.showToast({
          title: '复制成功',
          duration: 1000,
        })
      }
    })
  }
})