// pages/activity.js
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initPage();
  },

  initPage:function(){
    var topup_activity = wx.getStorageSync("topup_activity");
    topup_activity.beginDate = util.formatYMD(new Date(topup_activity.beginDate));
    topup_activity.endDate = util.formatYMD(new Date(topup_activity.endDate));
    var rule = topup_activity.rule && JSON.parse(topup_activity.rule) || [];
    rule.forEach(function (item) {
      item.conditionAmount && (item.conditionAmount = parseFloat(item.conditionAmount / 100).toFixed(2));
      item.discountVar && (item.discountVar = parseFloat(item.discountVar / 100).toFixed(2));
      item.discountMaxAmount && (item.discountMaxAmount = parseFloat(item.discountMaxAmount / 100).toFixed(2));
    });
    topup_activity.rule = rule;

    console.log(2,topup_activity)

    this.setData({
      activity:topup_activity
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