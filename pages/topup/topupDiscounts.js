// pages/topup/topupDiscounts.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.obj.listid = decodeURIComponent(options.listid);
    this.obj.spid = decodeURIComponent(options.spid);
    this.initPage();
  },
  obj:{},

  initPage:function(){
    var that = this;
    if (!this.obj.listid || !this.obj.spid) {
      wx.showModal({
        title: '出错了',
        content: '无法获取优惠信息',
        showCancel: false
      });
      return;
    }

    // 获取优惠信息
    wx.showLoading({
      title: '加载中',
      mask: true,
      success: function () {
        app.request({
          url: '/user/card/recharge/queryDiscountAmountDetail',
          data: {
            listid: that.obj.listid,
            spid: that.obj.spid,
          },
          success: function (res) {
            var discount = res.data.data;
             discount.discountAmount = util.formatFixed(discount.discountAmount);
            discount.couponDisAmountDesc && (discount.couponDisAmountDesc.discountAmount = util.formatFixed(discount.couponDisAmountDesc.discountAmount));
            discount.activityDisAmountDesc && (discount.activityDisAmountDesc.discountAmount = util.formatFixed(discount.activityDisAmountDesc.discountAmount));
            discount.rightsDisAmountDesc && (discount.rightsDisAmountDesc.levelRightsDiscountRmb = util.formatFixed(discount.rightsDisAmountDesc.levelRightsDiscountRmb));
            discount.rightsDisAmountDesc && (discount.rightsDisAmountDesc.increaseRmb = util.formatFixed(discount.rightsDisAmountDesc.increaseRmb));
            discount.rightsDisAmountDesc && (discount.rightsDisAmountDesc.reduceRmb = util.formatFixed(discount.rightsDisAmountDesc.reduceRmb));
            if (discount) {
              that.setData({
                discount
              });
            }
          },
          fail: function (res) {
            wx.showModal({
              title: '出错了',
              content: res.data.error.message,
              showCancel: false
            });
          },
          complete: function () {
            wx.hideLoading();
          }
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})