// pages/records/pointsList.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        bonus:null
    },
    obj: {
        currentPage: 1,
        hasNext: true,
        loading: false
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
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this;
        that.obj.currentPage = 1;
        that.obj.hasNext = true;
        that.loadData();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.obj.hasNext) {
            this.loadData();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    loadData: function () {
        var that = this;
        if(!this.obj.spid || !this.obj.cardId) {
            wx.showModal({
                title: '出错了',
                content: '无法获取会员卡信息',
                showCancel: false
            });
        }
        console.log(that.obj.loading)
        if (that.obj.hasNext && !that.obj.loading) {
            wx.showNavigationBarLoading();
            that.obj.loading = true;
            var currentPage = that.obj.currentPage;
            wx.showLoading({
                title: '加载中',
                mask: true,
                success: function () {
                    app.request({
                        url: '/user/card/bonus',
                        data: {
                            spid: that.obj.spid,
                            currentPage: currentPage,
                            pageSize: 10
                        },
                        success: function (res) {
                            var update = that.data.bonus;
                            var bonus = res.data.data;
                            if (bonus && bonus.dataList && bonus.dataList.length > 0) {
                                if (currentPage <= 1) {
                                    update = bonus;
                                } else {
                                    update.dataList = update.dataList.concat(bonus.dataList);
                                }
                                that.obj.currentPage = currentPage + 1;
                            }

                            if ((bonus.offset + 1) * bonus.limit >= bonus.total) {
                                that.obj.hasNext = false;
                            }
                            that.setData({
                                bonus:update
                            });
                        },
                        complete: function (res) {
                            wx.hideLoading();
                            wx.hideNavigationBarLoading();
                            wx.stopPullDownRefresh();
                            that.obj.loading = false;
                        }
                    });
                }
            });
        }
    }
});