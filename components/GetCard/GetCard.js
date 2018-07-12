// components/GetCard/GetCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {          // 信息数据
      type: Object,
      value: {
        'logoWx': '../../resource/image/card2.png',
        'rightsDiscribe': '描述',
        'brandName': '默认卡'
      }
    },
    ishidden: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getCardEvent() {
      var obj = this.properties.info;
      var myEventDetail = obj; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('getCardEvent', myEventDetail, myEventOption);
    }
  }
})
