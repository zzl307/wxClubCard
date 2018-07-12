// pages/coupons/couponListViewOnly.js
var util = require('../../utils/util.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        couponList: [],         // 优惠券列表
        useNoList: [],          // 不可用优惠券列表

        couponsOpenOffState: true,          // 不可用优惠券列表展示或显示状态
    },
    obj:{
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.obj.spid = decodeURIComponent(options.spid);
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

    // 选择优惠券
    selectCouponEvent:function(e){
        this.obj.selectCoupon = e.detail;
        if (this.obj.selectCoupon.wxCardId && this.obj.selectCoupon.wxCode) {
            wx.openCard({
                cardList: [{
                    cardId: this.obj.selectCoupon.wxCardId,
                    code: this.obj.selectCoupon.wxCode
                }],
                success: function (res) {

                },
                complete: function () {

                }
            });
        }
    },

    // 隐藏或显示无用优惠券
    couponsOpenOff:function(){
        this.setData({
            couponsOpenOffState:!this.data.couponsOpenOffState
        });
    },

    loadData: function () {
        var that = this;
        if (!this.obj.spid) {
            wx.showModal({
                title: '出错了',
                content: '无法获取优惠券列表',
                showCancel: false
            });
            return;
        }
        that.obj.loading = true;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/coupon/qryCouponList',
                    data: {
                        spid: that.obj.spid,
                    },
                    success: function (res) {
                        var couponList = [];
                        var useNoList = [];
                        if (res.data.data) {
                            var list = res.data.data.dataList || [];
                            for (var i = 0;i < list.length; i++) {
                                var one = list[i];
                                one.startDate = util.formatYMD(new Date(one.effectiveDate));
                                one.endDate = util.formatYMD(new Date(one.expiryDate));

                                if (one.type == 1) {
                                    one.typeName = '代金券';
                                    one.rightMoney = one.voucherPar;
                                    one.rightMoneyUnit = '元';
                                    one.couponColor = 'red';
                                } if (one.type == 2) {
                                    one.typeName = '折扣券';
                                    one.rightMoney = one.discountPar;
                                    one.rightMoneyUnit = '折';
                                    one.couponColor = 'blue';
                                } else if (one.type == 3) {
                                    one.typeName = '满贈券';
                                    one.rightMoney = one.presentPar
                                    one.rightMoneyUnit = '元';
                                    one.couponColor = 'indigo';
                                } else if (one.type == 4) {
                                    one.typeName = '兑换券';
                                    one.rightMoney = one.exchangeFaceVal
                                    one.rightMoneyUnit = '元';
                                    one.couponColor = 'yellow';
                                }

                                if (one.state === 2) {
                                    couponList.push(one);
                                } else {
                                    useNoList.push(one);
                                }
                            }

                            that.setData({
                                couponList,
                                useNoList
                            });

                            if(couponList.length == 0){
                                wx.showModal({
                                    title: '提示',
                                    content: '当前没有可使用的优惠券',
                                    showCancel: false,
                                    success: function(res) {
                                        if (res.confirm) {
                                            wx.navigateBack();
                                        }
                                    }
                                });
                            }
                        }
                    },
                    complete: function () {
                        wx.hideLoading();
                        wx.stopPullDownRefresh();
                        that.obj.loading = false;
                    }
                });
            }
        });
    }
});