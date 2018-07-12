// pages/topup/pay.js
var app = getApp();
var wxbarcode = require('../../utils/code');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        loading:true,
        card:{}
    },
    obj:{
        refresh:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.obj.spid = decodeURIComponent(options.spid);
        this.obj.cardId = decodeURIComponent(options.cardId);
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
        wx.setStorageSync('page_cardindex', true);
        wx.setStorageSync('page_carddetail', true);
        this.loadData();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload:function () {
        var timer = this.obj.timer;
        if (timer) {
            clearTimeout(timer);
        }
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

    },

    jumpToRecharge : function () {
        wx.navigateTo({
            url: '/pages/topup/topup?spid=' +  this.obj.spid + '&cardId=' + this.obj.cardId
        });
    },

    jumpToTradeList : function () {
        wx.navigateTo({
            url: '/pages/records/transactionList?spid=' +  this.obj.spid + '&cardId=' + this.obj.cardId
        });
    },

    handleRefreshCode:function () {
        if(!this.data.loading){
            this.loadData();
        }
    },

    handleAutoRefreshCode:function () {
        var that = this;
        var timer = that.obj.timer;
        if (timer) {
            clearTimeout(timer);
        }
        that.obj.timer = setTimeout(function () {
            that.loadData();
        }, 60000);
    },

    loadData:function () {
        var that = this;
        if (!this.obj.spid || !this.obj.cardId) {
            wx.showModal({
                title: '出错了',
                content: '无法获取会员卡信息',
                showCancel: false
            });
            return;
        }
        that.obj.loading = true;
        that.setData({
            loading:true
        });
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/consume/code',
                    data: {
                        spid: that.obj.spid,
                        cardId: that.obj.cardId
                    },
                    success: function (res) {
                        if (res.data.data){
                            var card = res.data.data;
                            card.balance = parseFloat(card.balance).toFixed(2);
                            card.flag = parseInt(card.balance * 100, 10) > 0;
                            var ottCode = card.ottCode;
                            if(card.flag && card.ottCode){
                                card.ottCode = card.ottCode.replace(/(.{4})/g, "$1 ")
                            }
                            that.setData({
                                loading:false,
                                card
                            });
                            if(card.flag){
                                wxbarcode.barcode('barcode', ottCode, 550, 170);
                                wxbarcode.qrcode('qrcode', card.link, 300, 300);
                            } else {
                                that.obj.refresh = false;
                            }
                        }
                    },
                    complete: function () {
                        wx.hideLoading();
                        that.obj.loading = false;
                        if(that.obj.refresh){
                            that.handleAutoRefreshCode();
                        }
                        that.setData({
                            loading:false
                        });
                    }
                });
            }
        });
    }
});