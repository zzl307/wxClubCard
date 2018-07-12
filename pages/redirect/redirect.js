// pages/card/cardDetail.js
var app = getApp();
Page({

    obj : {
        'coupons'           : '/pages/coupons/couponListViewOnly',
        'points'            : '/pages/records/pointsList',
        'transactions'      : '/pages/records/transactionList',
        'vip'               : '/pages/memberShip/myVip',
        'recharge'          : '/pages/topup/topup',
        'pay'               : '/pages/topup/pay',
        'detail'            : '/pages/card/cardDetail',
        'center'            : '/pages/card/cardIndex'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.options =  options;
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
        var scene = this.options.scene || '';
        if(scene) {
            wx.showLoading({
                title: '加载中',
                mask: true,
                success: function () {
                    wx.redirectTo({
                        url: '/pages/card/cardDetail?spid=' + scene,
                        success:function () {
                            wx.hideLoading();
                        }
                    });
                }
            });

        } else {
            var p = this.options.p;
            if(!p || !this.obj[p]){
                p = 'detail';
                // wx.showLoading({
                //     title: '加载中',
                //     mask: true,
                //     success: function () {
                //         wx.redirectTo({
                //             url: '/pages/card/cardIndex',
                //             success:function () {
                //                 wx.hideLoading();
                //             }
                //         });
                //     }
                // });
                // return;
            }

            var that = this;
            if(!that.options.card_id || !that.options.encrypt_code){
                wx.showModal({
                    title: '出错了',
                    content: '无效的参数，请重试',
                    showCancel: false
                });
                return;
            }

            wx.showLoading({
                title: '加载中',
                mask: true,
                success: function () {
                    app.request({
                        url: '/user/card/wechat/decrypt',
                        data: {
                            wxCardId:that.options.card_id,
                            encryptCode: that.options.encrypt_code
                        },
                        success: function (res) {
                            console.log(res.data)
                            if(res.data.data.spid && res.data.data.code){
                                wx.redirectTo({
                                    url: '/pages/card/cardDetail?spid=' + res.data.data.spid + '&redirect=' + that.obj[p] + '&cardId=' + res.data.data.code
                                });
                            } else {
                                wx.showModal({
                                    title: '出错了',
                                    content: '无效的参数，请重试',
                                    showCancel: false
                                });
                            }
                        },
                        complete: function (res) {
                            wx.hideLoading();
                        }
                    });

                }
            });
        }
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

    loadData: function () {

    }
});