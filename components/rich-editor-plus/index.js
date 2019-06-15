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
    /**
     * 方法：更新元素列表
     */
    update: function(index, nodeListAdded) {
      //splice 对于在0位置插入元素的情况下似乎会导致被加入的元素索引不正确
      //故采用其他方法代替
      let nodeListTemp = this.data.nodeList;
      let nodeList = []
      if (index == -1) {
        nodeList.push(...nodeListAdded)
        nodeList.push(...nodeListTemp)
      } else {
        nodeListTemp.splice(index + 1, 0, ...nodeListAdded);
        nodeList = nodeListTemp
      }
      this.setData({
        nodeList
      })
      this.triggerEvent("add", nodeList);
    },
    /**
     * 事件：添加微信聊天图片
     */
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
          this.update(index, nodeListTemp)
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
          this.update(index, nodeListTemp)
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
          this.update(index, [node])
        },
      })
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
