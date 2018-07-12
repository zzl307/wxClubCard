// pages/memberShip/myVip.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        card: {},
        swiperCurrent: 0 //当前正在显示的 swiper index
    },
    obj: { },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.obj.spid = options.spid;
        this.loadData();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    //swiper滚动时触发
    swiperChange: function (e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },

    loadData: function () {
        var that = this;
        if(!this.obj.spid) {
            wx.showModal({
                title: '出错了',
                content: '无法获取用户会员卡信息',
                showCancel: false
            });
            return;
        }
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/level',
                    data: {
                        spid: that.obj.spid
                    },
                    success: function (res) {
                        if (res.data.data) {
                            var swiperCurrent = this.data.swiperCurrent;
                            var data = res.data.data;
                            for (var i = 0;i < data.list.length;i++) {
                                var fi = data.list[i];
                                if(data.currentLevel === fi.level){
                                    swiperCurrent = i;
                                }

                                if(!fi.defaultUpLevelCondition && (data.upType === 1 || data.upType === 2)){
                                    fi.upLevelCondition = parseInt(fi.upLevelCondition, 10).toFixed(2);
                                }
                            }
                            that.setData({
                                swiperCurrent:swiperCurrent,
                                card: res.data.data
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
});