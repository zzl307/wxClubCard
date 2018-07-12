// pages/topup/topupResult.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order:{}
    },
    obj:{
        timeoutNo:0 //循环次数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.obj.spid = decodeURIComponent(options.spid);
        this.obj.orderNo = decodeURIComponent(options.orderNo);

        // this.obj.spid = "2000000182";
        // this.obj.orderNo = "1804251000225691285";
        this.loadData();
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

    jumpToBack : function () {
        wx.navigateBack({
            delta:2
        });
    },

    handleRefresh:function () {
        this.loadData();
    },

    // 跳转带优惠详情页面
    topupDiscounts:function(e){
        wx.navigateTo({
            url: '/pages/topup/topupDiscounts?listid='+this.data.order.listid+'&spid='+this.obj.spid
        });
    },

    // 领取优惠券
    getCoupon:function(){
        var that = this;
        if (!this.obj.spid) {
            wx.showModal({
                title: '出错了',
                content: '无法获取优惠券信息',
                showCancel: false
            });
            return;
        }
        that.obj.loading = true;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                var card = that.data.receiveCoupon || [];
                var objList = [];
                for(var i=0,len=card.length;i<len;i++){
                    var obj = {};
                    obj.cardId = card[i].wxCardId;
                    obj.cardExt = '{"code": "' + card[i].wxCode + '", "openid":"", "timestamp": "' + card[i].timestamp + '", "nonce_str":"' + card[i].nonceStr + '", "signature":"' + card[i].signature + '"}';
                    objList.push(obj);
                }
                if(objList.length>0){
                    wx.addCard({
                        cardList: objList,
                        success: function () {
                            wx.showModal({
                                title: '优惠券',
                                content: '领取成功',
                                showCancel: false
                            });
                        },
                        complete: function () {
                            wx.hideLoading();
                            that.obj.loading = false;
                        }
                    });
                }
            }
        });
    },

    loadData:function () {
        var that = this;
        if (!this.obj.spid || !this.obj.orderNo) {
            wx.showModal({
                title: '出错了',
                content: '无法获取订单信息',
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
                    url: '/user/card/recharge/result',
                    data: {
                        spid: that.obj.spid || '',
                        orderNo: that.obj.orderNo
                    },
                    success: function (res) {
                        if (res.data.data){
                            var order = res.data.data.result;
                            var receiveCoupon = res.data.data.receiveCoupon;
                            order.payAmount = parseFloat(order.payAmount).toFixed(2);
                            order.tradeAmount = parseFloat(order.tradeAmount).toFixed(2);
                            order.balance = parseFloat(order.balance).toFixed(2);
                            order.discountAmount = parseFloat(order.discountAmount).toFixed(2);
                            that.setData({
                                order:order,
                                receiveCoupon:receiveCoupon
                            });

                            // 充值成功或者失败，不刷新数据
                            if(order.state == 4 || order.state == 3){
                            }else{
                                that.loadResultData();
                            }
                        }
                    },
                    complete: function () {
                        wx.hideLoading();
                        that.obj.loading = false;
                    }
                });
            }
        });
    },

    loadResultData:function(){
        var that = this;
        app.request({
            url: '/user/card/recharge/result',
            data: {
                spid: that.obj.spid || '',
                orderNo: that.obj.orderNo
            },
            success: function (res) {
                if (res.data.data){
                    var order = res.data.data.result;
                    var receiveCoupon = res.data.data.receiveCoupon;
                    order.payAmount = parseFloat(order.payAmount).toFixed(2);
                    order.tradeAmount = parseFloat(order.tradeAmount).toFixed(2);
                    order.balance = parseFloat(order.balance).toFixed(2);
                    order.discountAmount = parseFloat(order.discountAmount).toFixed(2);
                    that.setData({
                        order:order,
                        receiveCoupon:receiveCoupon
                    });
                }

                that.obj.timeoutNo = that.obj.timeoutNo + 1;
                // 自动刷新数据,循环10次
                if(order.state == 4 || order.state == 3 || that.obj.timeoutNo >= 10){
                    var timer = that.obj.timer;
                    if (timer) {
                        clearTimeout(timer);
                    }
                }else{
                    that.obj.timer = setTimeout(function () {
                        that.loadResultData();
                    }, 2000);
                }
            },
            fail: function (){
                var timer = that.obj.timer;
                if (timer) {
                    clearTimeout(timer);
                }
            },
            complete: function () {

            }
        });
    }
});