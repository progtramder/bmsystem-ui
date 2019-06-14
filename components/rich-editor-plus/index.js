Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    nodeList: [],
  },

  attached: function () {
    const { windowHeight } = wx.getSystemInfoSync();
    this.setData({
      windowHeight,
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    addFile: function (e) {
      const index = e.currentTarget.dataset.index;
      wx.chooseMessageFile({
        count: 10,
        type: 'image',
        success: res => {
          let nodeListTemp = []
          res.tempFiles.forEach((e) => {
            const node = {
              type: 'image',
              src: e.path
            }
            nodeListTemp.push(node)
          })
          let nodeList = this.data.nodeList;
          nodeList.splice(index + 1, 0, ...nodeListTemp);
          this.setData({
            nodeList
          })
          this.triggerEvent("add", nodeList);
        },
      })
    },
    /**
     * 事件：添加图片
     */
    addImage: function (e) {
      const index = e.currentTarget.dataset.index;
      wx.chooseImage({
        success: res => {
          let nodeListTemp = []
          res.tempFilePaths.forEach((e) => {
            const node = {
              type: 'image',
              src: e
            }
            nodeListTemp.push(node)
          })
          let nodeList = this.data.nodeList;
          nodeList.splice(index + 1, 0, ...nodeListTemp);
          this.setData({
            nodeList
          })
          this.triggerEvent("add", nodeList);
        },
      })
    },

    addVideo: function (e) {
      const index = e.currentTarget.dataset.index;
      wx.chooseVideo({
        sourceType: ['album'],
        success: res => {
          const node = {
            type: 'video',
            src: res.tempFilePath
          }
          let nodeList = this.data.nodeList;
          nodeList.splice(index + 1, 0, node);
          this.setData({
            nodeList
          })
          this.triggerEvent("add", nodeList);
        },
      })
    },

    onTextInput(e) {
      const index = e.currentTarget.dataset.index;
      let nodeList = this.data.nodeList;
      nodeList[index].content = e.detail.value
    },

    imageTap(e) {
      let imgPaths = []
      imgPaths.push(e.currentTarget.dataset.imgpath)
      wx.previewImage({
        urls: imgPaths,
        current: imgPaths[0]
      })
    },

    /**
     * 事件：删除节点
     */
    deleteNode: function (e) {
      const index = e.currentTarget.dataset.index;
      let nodeList = this.data.nodeList;
      const nodes = nodeList.splice(index, 1);
      this.setData({
        nodeList,
      })
      this.triggerEvent("delete", { nodeList, node: nodes[0] });
    },

    init(nodeList) {
      this.setData({
        nodeList
      })
    },
  }
})
