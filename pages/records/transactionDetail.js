// pages/records/transactionDetail.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // nowMoney: '+1100.00元',
        // tranState: '充值成功',
        // memberNum: '82347192347195619287137',
        // tranTime: '2017- 12 - 29  18: 28:41',
        // orderFrom: '线上充值',
        // orderCode: '2834762873475924582084763876',
        // payMoney: '0.01元',
        detail : {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var tradeId = decodeURIComponent(options.tradeId);
        var spid = decodeURIComponent(options.spid);
        this.loadData(spid, tradeId);
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

    },

    loadData: function (spid, tradeId) {
        var that = this;
        if(!spid || !tradeId) {
            wx.showModal({
                title: '出错了',
                content: '无法获取交易信息',
                showCancel: false
            });
        }
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/transaction',
                    data: {
                        spid: spid,
                        listid: tradeId
                    },
                    success: function (res) {
                        that.setData({
                            detail:res.data.data
                        });
                    },
                    complete: function () {
                        wx.hideLoading();
                    }
                });
            }
        });
    }
});