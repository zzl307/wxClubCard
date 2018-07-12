// components/Coupon/Coupon.js
var Proxy = require('../../utils/eventProxy.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    key: {          // 组件标识码，唯一时，用于标识优惠只能选中其中一个,不唯一（或没有传值进来），可多选
      type: String,
      value: '-1'
    },
    disabled: {          // 是否禁用
      type: Boolean,
      value: false
    },
    isShowCheck: {          // 默认显示勾选按钮图标
      type: Boolean,
      value: true
    },
    isCheck: {          // 优惠券被是否选中
      type: Boolean,
      value: false,
      observer: function (newData, oldData) {
        this.data.isCheck = newData;
      }
    },
    couponColor: {          // 优惠券颜色
      type: String,
      value: 'red'
    },
    info: {          // 信息数据
      type: Object,
      value: {
        'couponName': '代金券',
        'typeName': '优惠券',
        'useCondition': '使用条件',
        'startDate': '2018.01.02',
        'endDate': '2018.03-06',
        'rightMoney': '10',
        'rightMoneyUnit': '元',
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isCheck: false //  优惠券被是否选中
  },

  // 生命周期函数
  ready: function () {
    // 监听者
    Proxy.eventProxy.on('coupon_module', (msg) => {
      // 将其他被选中的优惠券重置掉
      if (this.data.isCheck && msg !== this.properties.key) {
        this.setData({
          isCheck: false
        });
      }
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _selectCouponEvent() {
      var obj = this.properties.info;
      var isCheckFlag = !this.data.isCheck;
      if(this.properties.isShowCheck){
        this.setData({
          isCheck: isCheckFlag
        });
      }
      obj.isCheck = isCheckFlag;

      if (isCheckFlag) {
        // 发布者
        Proxy.eventProxy.trigger('coupon_module', this.properties.key);
      }

      var myEventDetail = obj; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('selectCouponEvent', myEventDetail, myEventOption);
    }
  }
})
