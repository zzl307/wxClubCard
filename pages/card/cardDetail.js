// pages/card/cardDetail.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        newUser: true,
        card : null
    },
    obj: {
        loading: false,
        needLoad : true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setStorageSync('page_carddetail', true);
        this.obj.spid = decodeURIComponent(options.spid);
        var redirect = decodeURIComponent(options.redirect || '');
        var cardId = decodeURIComponent(options.cardId || '');
        if(redirect && redirect !== '/pages/card/cardDetail' && cardId){
            var that = this;
            this.obj.needLoad = false;
            wx.navigateTo({
                url: redirect + '?spid=' + that.obj.spid + '&cardId=' + cardId,
                complete:function () {
                    that.obj.needLoad = true;
                }
            });
        }
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
        if(this.obj.needLoad){
            var needloading = wx.getStorageSync('page_carddetail') || false;
            if (needloading) {
                wx.removeStorageSync('page_carddetail');
                this.loadData();
            }
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
        this.loadData();
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
        var that = this;
        if(!this.obj.spid) {
            wx.showModal({
                title: '出错了',
                content: '无法获取领卡商户信息',
                showCancel: false
            });
            return;
        }
        wx.showNavigationBarLoading();
        that.obj.loading = true;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/query',
                    data: {
                        spid: that.obj.spid
                    },
                    success: function (res) {
                        if (res.data.data) {
                            if(!res.data.data.newUser && res.data.data.userCard){
                                res.data.data.userCard.balance = res.data.data.userCard.balance.toFixed(2);
                            }
                            that.setData({
                                newUser: res.data.data.newUser,
                                card : res.data.data.card,
                                userCard : res.data.data.userCard
                            });
                        }
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
    },

    handleCardClick:function (e) {
        var that = this;
        if(!this.obj.spid) {
            wx.showModal({
                title: '出错了',
                content: '无法获取领卡商户信息',
                showCancel: false
            });
            return;
        }

        var cardId = e.currentTarget.dataset.id;
        if(this.data.userCard){
            that.obj.loading = true;
            wx.showLoading({
                title: '加载中',
                mask: true,
                success: function () {
                    app.request({
                        url: '/user/card/open',
                        data: {
                            cardId:cardId,
                            spid: that.obj.spid
                        },
                        success: function (res) {
                            if (res.data && res.data.data && res.data.data.wxPacket) {
                                wx.openCard({
                                    cardList: [{
                                        cardId: res.data.data.wxCardId,
                                        code: res.data.data.code
                                    }],
                                    success: function (res) {
                                        that.loadData(true);
                                    }
                                });
                            } else {
                                var card = (res.data && res.data.data) || {};
                                wx.addCard({
                                    cardList: [{
                                        cardId: card.wxCardId,
                                        cardExt: '{"code": "' + card.code + '", "openid":"", "timestamp": "' + card.timestamp + '", "nonce_str":"' + card.nonceStr + '", "signature":"' + card.signature + '"}'
                                    }],
                                    success: function (res) {
                                        that.loadData();
                                    }
                                });
                            }
                        },
                        complete: function (res) {
                            wx.hideLoading();
                            that.obj.loading = false;
                        }
                    });
                }
            });
        }
    },

    handleRecieveCardClick:function (e) {
        var that = this;
        if(!this.obj.spid) {
            wx.showModal({
                title: '出错了',
                content: '无法获取领卡商户信息',
                showCancel: false
            });
            return;
        }

        if(this.data.card){
            that.obj.loading = true;
            wx.showLoading({
                title: '加载中',
                mask: true,
                success: function () {
                    app.request({
                        url: '/mch/card/recieve',
                        data: {
                            spid: that.obj.spid
                        },
                        success: function (res) {
                            if (res.data && res.data.data && res.data.data.wxPacket) {
                                wx.openCard({
                                    cardList: [{
                                        cardId: res.data.data.wxCardId,
                                        code: res.data.data.code
                                    }],
                                    success: function () {
                                        that.loadData(true);
                                    }
                                });
                            } else {
                                var card = (res.data && res.data.data) || {};
                                wx.addCard({
                                    cardList: [{
                                        cardId: card.wxCardId,
                                        cardExt: '{"code": "' + card.code + '", "openid":"", "timestamp": "' + card.timestamp + '", "nonce_str":"' + card.nonceStr + '", "signature":"' + card.signature + '"}'
                                    }],
                                    success: function () {
                                        that.loadData();
                                    },
                                    fail:function (addres) {
                                        if(addres.errMsg === 'addCard:fail cancel'){
                                            that.loadData();
                                        }
                                    }
                                });
                            }
                        },
                        complete: function (res) {
                            wx.hideLoading();
                            that.obj.loading = false;
                        }
                    });
                }
            });
        }
    }
});