//app.js
App({
    onLaunch: function () {
        console.log('onLaunch');
        wx.clearStorageSync();
    },
    onShow: function () {
        // Do something when show.
        console.log('onShow');
    },
    onHide: function () {
        // Do something when hide.
        console.log('onHide');
    },
    onError: function (msg) {
        console.log('onError');
    },
    login: function (cb, options) {
        options = options || {};
        var that = this;
        wx.login({
            success: function (wxloginres) {
                if (wxloginres.code) {
                    wx.getUserInfo({
                        withCredentials: true,
                        success: function (wxgetuserres) {
                            // 将key和用户绑定
                            wx.request({
                                url: that.globalData.apiurl + '/login',
                                method: 'POST',
                                header: {
                                    'content-type': 'application/json'
                                },
                                data: {
                                    code: wxloginres.code,
                                    rawData: wxgetuserres.rawData,
                                    signature: wxgetuserres.signature,
                                    encryptedData: wxgetuserres.encryptedData,
                                    iv: wxgetuserres.iv
                                },
                                success: function (syncres) {
                                    if (!that.isSuccess(syncres.data) || syncres.statusCode !== 200) {
                                        var flag = false;
                                        if (typeof options.complete === 'function') {
                                            flag = options.complete(syncres, 'wxsyncuser');
                                        }

                                        if(!flag){
                                            that.parseError(syncres.data);
                                        }
                                        return;
                                    }
                                    wx.setStorageSync('sessionid', syncres.data.data && syncres.data.data.sessionId);
                                    typeof cb === "function" && cb(syncres.data.data && syncres.data.data.user);
                                },
                                fail: function () {

                                },
                                complete: function (syncres) {
                                    if (syncres.statusCode !== 200) {
                                        var flag = false;
                                        if (typeof options.complete === 'function') {
                                            flag = options.complete(syncres, 'wxsyncuser');
                                        }
                                        if(!flag){
                                            wx.showModal({
                                                title: '出错了',
                                                content: '服务器繁忙,请稍后重试',
                                                showCancel: false
                                            });
                                        }
                                    }
                                }
                            });
                        },
                        fail: function (wxgetuserres) {
                            var flag = false;
                            if (typeof options.complete === 'function') {
                                flag = options.complete(wxgetuserres, 'wxgetuser');
                            }

                            if(!flag){
                                wx.showModal({
                                    title: '出错了',
                                    content: '获取用户信息失败',
                                    showCancel: false
                                });
                            }
                        },
                        complete: function (res) {

                        }
                    });
                } else {
                    console.log('获取用户登录态code失败:' + wxloginres);
                    var flag = false;
                    if (typeof options.complete === 'function') {
                        flag = options.complete(wxloginres, 'wxlogincode');
                    }

                    if(!flag){
                        wx.showModal({
                            title: '出错了',
                            content: '获取用户信息失败',
                            showCancel: false
                        });
                    }
                }
            },
            fail: function (wxloginfail) {
                var flag = false;
                if (typeof options.complete === 'function') {
                    flag = options.complete(wxloginfail, 'wxlogin');
                }

                if(!flag){
                    wx.showModal({
                        title: '出错了',
                        content: '获取用户信息失败',
                        showCancel: false
                    });
                }
            }
        });
    },
    auth : function (cb) {
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    wx.authorize({
                        scope: 'scope.userInfo',
                        success() {
                            cb();
                        },
                        fail() {
                            wx.openSetting({
                                success: (authSetting) => {
                                    console.log(authSetting)
                                },
                                fail:function () {

                                }
                            })
                        }
                    });
                } else {
                    cb();
                }
            }
        });
    },

    request: function (options, notretry, noCheckAuth, noCheckSession) {
        var that = this;
        if(!noCheckAuth) {
            this.auth(function () {
                that.request(options, false, true, false);
            });
        } else if(!noCheckSession) {
            wx.checkSession({
                success: function () {
                    that.request(options, false, true, true);
                },
                fail: function () {
                    wx.removeStorageSync('sessionid');
                    that.request(options, false, true, true);
                }
            });
        } else {
            var sessionId = wx.getStorageSync('sessionid');
            if (!sessionId) {
                that.login(function () {
                    that.request(options, false, true, true);
                }, options);
                return;
            } else {
                var data = options.data || {};
                var apiurl = options.apiurl || that.globalData.apiurl;
                var header = options.header || {};
                header['content-type'] = header['content-type'] || 'application/json';

                data.sessionId = sessionId;
                wx.request({
                    url: apiurl + options.url,
                    method: options.method || 'POST',
                    header: header,
                    data: data,
                    success: function (res) {
                        if (res.data && !res.data.data && !res.data.status && res.data.error && res.data.error.code === 'common.not.login' && !notretry) {
                            that.login(function () {
                                that.request(options, true, true, true);
                            }, options);
                            return;
                        }

                        if (!that.isSuccess(res.data) || res.statusCode !== 200) {
                            if(typeof options.fail === 'function'){
                                options.fail(res);
                            } else {
                                that.parseError(res.data);
                            }
                            return;
                        }

                        typeof options.success === 'function' && options.success(res);
                    },
                    dataType: options.dataType || 'json',
                    fail: function (res) {
                        if (typeof options.fail === 'function') {
                            options.fail(res);
                        } else {
                            wx.showModal({
                                title: '出错了',
                                content: '服务器繁忙,请稍后重试',
                                showCancel: false
                            });
                        }
                    },
                    complete: function (res) {
                        var flag = false;
                        if (typeof options.complete === 'function') {
                            flag = options.complete(res, 'request');
                        }

                        if(!flag){
                            if (res.statusCode !== 200) {
                                wx.showModal({
                                    title: '出错了',
                                    content: '服务器繁忙,请稍后重试',
                                    showCancel: false
                                });
                            }
                        }
                    }
                });
            }
        }
    },
    globalData: {
        // apiurl: 'https://d4.infix.siemin.com/wxapp'
        // apiurl: 'https://testapp.test.siemin.com/wxapp'
        apiurl: 'https://eppc.siemin.com/wxapp'
    },
    isSuccess: function (result) {
        return !result || (typeof result.status === 'undefined' || result.status);
    },
    parseError: function (result) {
        if (result && typeof result.status !== 'undefined' && !result.status) {
            wx.showModal({
                title: '出错了',
                content: result.error.message || '服务器繁忙,请稍后重试',
                showCancel: false
            });
        }
    }
})