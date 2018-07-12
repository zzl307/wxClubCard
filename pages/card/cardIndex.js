// pages/card/cardIndex.js
var app = getApp();
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardList: [],

        imgUrls: [
            '../../resource/image/member_card_banner.png'
            // 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            // 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
        ],
        indicatorDots: false,
        autoplay: true,
        interval: 5000,
        duration: 1000
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
        wx.setStorageSync('page_cardindex', true);
        wx.removeStorageSync('page_cardindexnewu');
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
        var that = this;
        var needloading = wx.getStorageSync('page_cardindex') || false;
        if (needloading) {
            that.obj = {
                currentPage: 1,
                hasNext: true,
                loading: false
            };
            that.loadData(true);
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
        var that = this;
        that.obj.currentPage = 1;
        that.obj.hasNext = true;
        that.loadData(true);
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

    loadData: function (flag) {
        var that = this;
        if (that.obj.hasNext && !that.obj.loading) {
            if (flag) {
                wx.showNavigationBarLoading();
            }
            that.obj.loading = true;
            // var currentPage = that.obj.currentPage;
            var currentPage = 1;
            wx.showLoading({
                title: '加载中',
                mask: true,
                success: function () {
                    app.request({
                        url: '/user/card/list',
                        data: {
                            currentPage: currentPage,
                            pageSize: 10
                        },
                        success: function (res) {
                            try {
                                wx.setStorageSync('page_cardindex', false);
                            } catch (e) {
                            }
                            var data = res.data.data;
                            if (data && data.length > 0) {
                                var data = res.data.data || [];
                                data.forEach(function (item) {
                                    item.expEndDate = util.formatYMD(new Date(item.expEndDate));
                                    item.balance = util.formatFixed(item.balance / 100);
                                });
                                that.setData({
                                    cardList: data
                                });
                            } else if (currentPage === 1) {
                                wx.navigateTo({
                                    url: '/pages/card/cardIndexNewUsr'
                                });
                            }
                        },
                        complete: function (res) {
                            wx.hideLoading();
                            if (flag) {
                                wx.hideNavigationBarLoading();
                            }
                            wx.stopPullDownRefresh();
                            that.obj.loading = false;
                        }
                    });
                }
            });

        }
    },

    handleCardClick: function (e) {
        var cardId = e.currentTarget.dataset.id;
        var spid = e.currentTarget.dataset.spid;
        wx.navigateTo({
            url: '/pages/card/cardDetail?spid=' + spid + '&cardId=' + cardId
        });
        // var that = this;
        // wx.showLoading({
        //     title: '加载中',
        //     mask: true,
        //     success: function () {
        //         app.request({
        //             url: '/user/card/open',
        //             data: {
        //                 cardId: cardId,
        //                 spid: spid
        //             },
        //             success: function (res) {
        //                 if (res.data && res.data.data && res.data.data.wxPacket) {
        //                     wx.openCard({
        //                         cardList: [{
        //                             cardId: res.data.data.wxCardId,
        //                             code: res.data.data.code
        //                         }],
        //                         success: function (res) {
        //                             // that.loadData(true);
        //                         }
        //                     });
        //                 } else {
        //                     var card = (res.data && res.data.data) || {};
        //                     wx.addCard({
        //                         cardList: [{
        //                             cardId: card.wxCardId,
        //                             cardExt: '{"code": "' + card.code + '", "openid":"", "timestamp": "' + card.timestamp + '", "nonce_str":"' + card.nonceStr + '", "signature":"' + card.signature + '"}'
        //                         }],
        //                         success: function (res) {
        //                             // that.loadData(true);
        //                         }
        //                     });
        //                 }
        //             },
        //             complete: function (res) {
        //                 wx.hideLoading();
        //             }
        //         });
        //     }
        // });
    }
});