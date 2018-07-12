// pages/topup/topup.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardSelected: 0,                        // 当前选中的 对应cardList下标, -1 表示未选中
        otherAmountFoucs: false,                // 其它金额是否选中
        otherAmountValue: "其它金额",            // 其它金额
        
        switchChecked: false,                   // 积分抵扣金额是否选中
        
        checked: true,                          // 电子卡指引是否选中
        config: {},                             // 面值配置
        discount: {},                           // 计算后数据
        activity: {},                           // 活动信息
        
        counponSeleccted: {},                   // 已经选择好的优惠券
        userBonusValue: 0,                      // 积分
    },
    obj: {
        userBonus: 0,                           // 使用的积分数
        loading: false,                         // 当前页面ajax请求状态
        caling: 0,                              // 当前计算的请求数
        tempArray:[],

        couponList:[],                          // 可用优惠券
        useNoList:[]                            // 不可用优惠券
    },

    onShow:function(){
        // 获取选择的优惠券信息
        var counpon_selecct = wx.getStorageSync('counpon_selecct').selectCoupon||{};
        this.setData({
            counponSeleccted:counpon_selecct
        });
        // 选完优惠券后重新计算金额
        var amount = this.obj.lastOrderAmount;
        if(amount>0){
            this.loadCalMoney(amount, function () {});
        }

        console.log(this.data)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.obj.spid = decodeURIComponent(options.spid);
        this.obj.cardId = decodeURIComponent(options.cardId);
        this.loadMoney();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
    },

    onUnload:function () {
        wx.removeStorageSync('counpon_selecct');
        wx.removeStorageSync('topup_activity');
        var timer = this.obj.timer;
        if (timer) {
            clearTimeout(timer);
        }
    },

    /**
     * 选中/取消选中电子指引
     * @param e 事件对象
     */
    toggleCheck: function (e) {
        this.setData({
            checked: !this.data.checked
        })
    },

    /**
     * 跳转至电子卡指引页
     */
    jumpToGuide: function () {
        wx.navigateTo({
            url: '/pages/help/eGuide'
        });
    },

    /**
     * 点击优惠券后条状优惠券页面
     * @param e 事件对象
     */
    jumpToCoupon: function (e) {
        var useCondition = parseFloat(this.data.amount).toFixed(2) * 100;
        wx.navigateTo({
            url: '/pages/coupons/couponList?spid=' + this.obj.spid + '&cardId=' + this.obj.cardId + '&useCondition=' + useCondition
        });
    },

    /**
     * 预先定义的数字金额 点击时触发
     * @param e 事件对象
     */
    handleConfigClick: function (e) {
        var that = this;
        var index = parseInt(e.currentTarget.dataset.index, 10);
        var amount = parseFloat(e.currentTarget.dataset.amount).toFixed(2) * 100;
        // 清空所选择的优惠券
        wx.removeStorageSync('counpon_selecct');

        that.obj.userBonus = 0;
        that.obj.lastOrderAmount = amount;
        this.loadCalMoney(amount, function () {
            that.setData({
                cardSelected: index,
                otherAmountValue: "其它金额",
                otherAmountFoucs: false,
                userBonusValue: 0,
                switchChecked: false,
                counponSeleccted: {}
            });
        });
    },

    /**
     * 其他金额 点击时触发
     * @param e 事件对象
     */
    handleAmountFocus: function () {
        var otherAmountValue = (this.data.otherAmountValue === '其它金额' ? '' : this.data.otherAmountValue);
        var discount = this.data.otherAmountValue === '其它金额' ? {} : this.data.discount;
        this.obj.userBonus = 0;
        // 清空所选择的优惠券
        wx.removeStorageSync('counpon_selecct');
        this.setData({
            userBonusValue: 0,
            switchChecked: false,
            counponSeleccted: {},
            otherAmountFoucs: true,
            otherAmountValue: otherAmountValue,
            discount,
            cardSelected: -1                        // 清除 预先定义的数字金额 选中效果
        });
    },

    /**
     * 其他金额 输入时触发
     * @param e 事件对象
     */
    handleOtherAmountInput: function (e) {
        var that = this;
        var org = e.detail.value;
        if (!org) {
            this.setData({
                otherAmountValue: '',
                discount: {}
            });
            return;
        }

        // 先调整数据
        var index = org.indexOf('.');
        // 小数点开头
        if(index === 0){
            this.setData({
                otherAmountValue: '',
                discount: {}
            });
            return;
        } else if(index > 0){// 包含小数点
            var tempOrg;
            var tempOrgs = org.split('.');
            if(tempOrgs[1].length > 2){
                tempOrg = tempOrgs[0] + '.' + tempOrgs[1].substring(0, tempOrgs[1].length - 1);
            } else {
                tempOrg = org;
            }
            org = tempOrg;
            this.setData({
                otherAmountValue: org
            });
        }

        // 截取以小数点结尾的金额
        var input = (org.lastIndexOf('.') === org.length - 1 ? org.substring(0, org.length - 1) : org);

        var inputVal = parseFloat(input).toFixed(2) * 100;
        var min = parseFloat(e.currentTarget.dataset.min).toFixed(2) * 100;
        var max = parseFloat(e.currentTarget.dataset.max).toFixed(2) * 100;
        if (inputVal > max) {
            // input = input.substring(0, org.length - 1);
            this.setData({
                otherAmountValue: input
            });
        } else if (inputVal < min) {
            console.log('输入值:',inputVal +'最大值:'+ max+"最小值:"+min);
        } else {
            var amount = parseFloat(input).toFixed(2) * 100;
            that.obj.lastOrderAmount = amount;
            // var timer = that.obj.timer;
            // if (timer) {
            //     clearTimeout(timer);
            // }
            // var amount = parseFloat(input).toFixed(2) * 100;
            // that.obj.lastOrderAmount = amount;
            // that.obj.timer = setTimeout(function () {
            //     that.loadCalMoney(amount, function () {
            //         that.setData({
            //             otherAmountValue: org
            //         });
            //     });
            // }, 500);
        }
    },

    /**
     * 其它金额 失去焦点时触发
     * @param e 事件对象
     */
    handleOtherAmountBlur: function (e) {
        var that = this;
        var org = e.detail.value;
        if (!org) {
            that.setData({
                otherAmountValue: '其它金额',
                discount: {}
            });
            return;
        }
        var inputVal = parseFloat(org).toFixed(2) * 100;
        var min = parseFloat(e.currentTarget.dataset.min).toFixed(2) * 100;
        var max = parseFloat(e.currentTarget.dataset.max).toFixed(2) * 100;

        console.log('失焦事件：',inputVal +':'+ max+":"+min+":"+org);
        if (inputVal < min) {
            wx.showModal({
                title: '提示',
                content: '面值最小不能低于' + parseFloat(min/100).toFixed(2) + '元',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        that.obj.lastOrderAmount = min;
                        that.loadCalMoney(min, function () {
                            that.setData({
                                otherAmountValue: parseFloat(min/100).toFixed(2)
                            });
                        });
                    }
                }
            });
        } else if (inputVal > max) {
            wx.showModal({
                title: '提示',
                content: '面值最大不能超过' + parseFloat(max/100).toFixed(2) + '元',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        that.obj.lastOrderAmount = max;
                        that.loadCalMoney(max, function () {
                            that.setData({
                                otherAmountValue: parseFloat(max/100).toFixed(2)
                            });
                        });
                    }
                }
            });
        }else{
            that.obj.lastOrderAmount = inputVal;
            that.loadCalMoney(inputVal, function () {
                that.setData({
                    otherAmountValue: org
                });
            });
        }
    },

    /**
     * 积分 输入时触发
     */
    userBonusInput: function (e) {
        var that = this;
        var inputVal = e.detail.value;
        if (!inputVal) {
            return;
        }
        this.obj.userBonus=inputVal;
    },

    /**
     * 积分 失去焦点时触发
     */
    userBonusBlur: function (e) {
        this.userBonusCheck(e);
    },
    userBonusCheck:function(e){
        var that = this;
        var org = e.detail.value;
        if (!org) {
            return;
        }
        var inputVal = e.detail.value;
        var min = parseFloat(e.currentTarget.dataset.min);
        var max = parseFloat(e.currentTarget.dataset.max);

        if (inputVal < min) {
            wx.showModal({
                title: '提示',
                content: '积分最小不能低于' + min,
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        that.obj.userBonus = min;
                        that.loadCalMoney(that.obj.lastOrderAmount, function () {
                            that.setData({
                                userBonusValue: min
                            });
                        });
                    }
                }
            });
        } else if (inputVal > max) {
            wx.showModal({
                title: '提示',
                content: '积分最大不能超过' + max,
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        that.obj.userBonus = max;
                        that.loadCalMoney(that.obj.lastOrderAmount, function () {
                            that.setData({
                                userBonusValue: max
                            });
                        });
                    }
                }
            });
        }else{
            var bonus = this.data.config.bonus;
            if(inputVal>bonus){
                wx.showModal({
                    title: '提示',
                    content: '不能超过剩余积分' + bonus,
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            that.obj.userBonus = bonus;
                            that.loadCalMoney(that.obj.lastOrderAmount, function () {
                                that.setData({
                                    userBonusValue: bonus
                                });
                            });
                        }
                    }
                });
            }else{
                that.obj.userBonus = inputVal;
                var amount = this.obj.lastOrderAmount;
                that.loadCalMoney(amount, function () {
                    that.setData({
                        userBonusValue: inputVal
                    });
                });
            }
        }
    },

    handleRechargeOrder: function () {
        var that = this;
        if (!this.obj.spid || !this.obj.cardId) {
            wx.showModal({
                title: '出错了',
                content: '无法获取会员卡信息',
                showCancel: false
            });
            return;
        }
        if(this.data.switchChecked){
            var inputVal = this.obj.userBonus;
            var min = parseFloat(1);
            var max = parseFloat(this.data.config.bonusDeduction.maxReduceBonus);

            console.log(inputVal,min,max);
            if (inputVal < min) {
                wx.showModal({
                    title: '出错了',
                    content: '积分最小不能低于' + min,
                    showCancel: false
                });
                return;
            } else if (inputVal > max) {
                wx.showModal({
                    title: '出错了',
                    content: '积分最大不能超过' + max,
                    showCancel: false
                });
                return;
            } else {
                var bonus = this.data.config.bonus;
                if (inputVal > bonus) {
                    wx.showModal({
                        title: '出错了',
                        content: '不能超过剩余积分' + bonus,
                        showCancel: false
                    });
                    return;
                }
            }
        }
        if (!this.data.checked) {
            wx.showModal({
                title: '出错了',
                content: '请先阅读并同意《电子卡指引》',
                showCancel: false
            });
            return;
        }
        if (!that.data.discount.orderAmount || that.data.discount.orderAmount <= 0) {
            wx.showModal({
                title: '出错了',
                content: '您需要先选择充值的面额',
                showCancel: false
            });
            return;
        }
        var amount = parseFloat(that.data.discount.orderAmount).toFixed(2) * 100;
        var payAmount = parseFloat(that.data.discount.payAmount).toFixed(2) * 100;

        var counpon_selecct = wx.getStorageSync('counpon_selecct').selectCoupon||{};

        that.obj.loading = true;
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/recharge/order',
                    data: {
                        amt: amount,
                        cardId: that.obj.cardId || '',
                        costBonus: that.obj.userBonus && parseInt(that.obj.userBonus) || '',
                        couponId:  counpon_selecct.couponId || '',
                        payAmount: payAmount,
                        activityId: that.data.activity.activityId || '',
                        spid: that.obj.spid || '',
                    },
                    success: function (res) {
                        wx.setStorageSync('page_cardindex', true);
                        wx.setStorageSync('page_carddetail', true);
                        if (res.data.data.needWxPay) {
                            var payInfo = JSON.parse(res.data.data.payInfo);
                            wx.requestPayment({
                                'timeStamp': payInfo.timeStamp,
                                'nonceStr': payInfo.nonceStr,
                                'package': payInfo['package'],
                                'signType': payInfo.signType,
                                'paySign': payInfo.paySign,
                                'success': function (payres) {
                                    wx.navigateTo({
                                        url: '/pages/topup/topupResult?spid=' + (that.obj.spid || '') + '&orderNo=' + res.data.data.listid
                                    });
                                },
                                'fail': function (payres) {

                                },
                                'complete': function (payres) {
                                    wx.removeStorageSync('counpon_selecct');
                                }
                            });
                        } else {
                            wx.removeStorageSync('counpon_selecct');
                            wx.navigateTo({
                                url: '/pages/topup/topupResult?spid=' + (that.obj.spid || '') + '&orderNo=' + res.data.data.listid
                            });
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

    /**
     * 初始化加载配置信息
     */
    loadMoney: function () {
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
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/recharge/config',
                    data: {
                        spid: that.obj.spid,
                        cardId: that.obj.cardId
                    },
                    success: function (res) {
                        if (res.data.data) {
                            var config = res.data.data.config;
                            var discount = res.data.data.discount;
                            var activity = res.data.data.activity || {};

                            wx.setStorageSync("topup_activity",activity);

                            // 默认填充第一个充值金额
                            that.obj.lastOrderAmount = parseFloat(config.cardAmount1).toFixed(2) * 100;

                            discount.discountBonusAmount = parseFloat(discount.discountBonusAmount / 100).toFixed(2);
                            discount.discountCouponAmount = parseFloat(discount.discountCouponAmount / 100).toFixed(2);
                            discount.discountActivityAmount = parseFloat(discount.discountActivityAmount / 100).toFixed(2);
                            discount.discountRightAmount = parseFloat(discount.discountRightAmount / 100).toFixed(2);

                            discount.orderAmount = parseFloat(discount.orderAmount / 100).toFixed(2);
                            discount.discountAmount = parseFloat(discount.discountAmount / 100).toFixed(2);
                            discount.tradeAmount = parseFloat(discount.tradeAmount / 100).toFixed(2);
                            discount.payAmount = parseFloat(discount.payAmount / 100).toFixed(2);

                            that.setData({
                                config:config,
                                discount:discount,
                                activity:activity
                            });
                        }
                        that.getCouponList();
                    },
                    complete: function () {
                        wx.hideLoading();
                        that.obj.loading = false;
                    }
                });
            }
        });
    },

    // 获取优惠券列表
    getCouponList:function (){
        var that = this;
        app.request({
            url: '/user/card/coupon/qryCanAndCantUseCoupon',
            data: {
                useSceneType:2,
                useCondition: that.obj.lastOrderAmount,
                cardId: that.obj.cardId,
                spid: that.obj.spid,
            },
            success: function (res) {
                var couponList = [];
                var useNoList = [];
                if (res.data.data) {
                    var list = res.data.data.dataList || [];
                    for (var i = 0;i < list.length; i++) {
                        var one = list[i];
                        if (one.canUse === 1) {
                            couponList.push(one);
                        } else {
                            useNoList.push(one);
                        }
                    }
                    that.obj.couponList= couponList;
                    that.obj.useNoList= useNoList;
                }
            }
        });
    },

    // 跳转到活动页面
    goActivity:function(e){
        wx.navigateTo({
            url: '/pages/activity/activity'
        });
    },
    // 选择优惠券
    selectCoupons:function(e){
        if(this.obj.couponList.length == 0){
            wx.showModal({
                title: '提示',
                content: '当前没有可使用的优惠券',
                showCancel: false
            });
        }else{
            wx.navigateTo({
                url: '/pages/coupons/couponList?useSceneType=2&useCondition='+this.obj.lastOrderAmount+'&cardId='+this.obj.cardId+'&spid='+this.obj.spid
            });
        }
    },

    // 积分抵扣金额
    integralSwitchChange:function(){
        var triggerConditionValue = this.data.config.bonusDeduction.triggerConditionValue;
        var tempTriggerConditionValue = parseFloat(triggerConditionValue).toFixed(2) * 100;
        if (tempTriggerConditionValue > this.obj.lastOrderAmount) {
            wx.showModal({
                title: '提示',
                content: '订单金额需要满足' + triggerConditionValue + '元才能使用积分抵扣',
                showCancel: false,
            });
            return;
        }

        var switchChecked = !this.data.switchChecked;
        if(switchChecked == false){
            this.obj.userBonus = 0;
            this.setData({
                userBonusValue:0,
            });
            this.loadCalMoney(this.obj.lastOrderAmount, function () {});
        }
        this.setData({
            switchChecked:switchChecked
        })
    },

    // 会员权益优惠
    goMyVIP:function(){
        wx.navigateTo({
            url: '/pages/memberShip/myVip?spid=' + this.obj.spid
        });
    },

    /**
     * 计算支付金额信息
     * @param amt 面值
     * @param cb 回调
     */
    loadCalMoney: function (amt, cb) {
        var that = this;
        if (!this.obj.spid || !this.obj.cardId) {
            wx.showModal({
                title: '出错了',
                content: '无法获取会员卡信息',
                showCancel: false
            });
            return;
        }

        if(that.obj.caling === 0){
            that.obj.caling = 1;
        }

        // 获取选择的优惠券信息
        var counpon_selecct = wx.getStorageSync('counpon_selecct').selectCoupon||{};

        // 金额计算
        wx.showLoading({
            title: '加载中',
            mask: true,
            success: function () {
                app.request({
                    url: '/user/card/recharge/cal',
                    data: {
                        payAmount: amt || 0,
                        couponConfigId: counpon_selecct.couponConfigId || '',
                        orderAmount: amt || 0,
                        sceneType: 2,
                        activityId: that.data.activity.activityId || '',
                        couponId: counpon_selecct.couponId || '',
                        memberCardId: that.obj.cardId,
                        costBonus: that.obj.userBonus||'',
                        memberConfigId: that.data.config.pcid,
                        spid: that.obj.spid,
                        pcid: that.data.config.pcid
                    },
                    success: function (res) {
                        console.log('查询:' + that.obj.lastOrderAmount + '-' + amt);
                        if (res.data.data && that.obj.lastOrderAmount === amt) {
                            console.log('设置:' + that.obj.lastOrderAmount + '-' + amt);
                            that.obj.caling = 2;
                            var discount = res.data.data;

                            discount.discountCouponAmount = parseFloat(discount.discountCouponAmount / 100).toFixed(2);
                            discount.discountActivityAmount = parseFloat(discount.discountActivityAmount / 100).toFixed(2);
                            discount.discountRightAmount = parseFloat(discount.discountRightAmount / 100).toFixed(2);

                            discount.discountBonusAmount = parseFloat(discount.discountBonusAmount / 100).toFixed(2);
                            discount.orderAmount = parseFloat(discount.orderAmount / 100).toFixed(2);
                            discount.discountAmount = parseFloat(discount.discountAmount / 100).toFixed(2);
                            discount.tradeAmount = parseFloat(discount.tradeAmount / 100).toFixed(2);
                            discount.payAmount = parseFloat(discount.payAmount / 100).toFixed(2);
                            that.setData({
                                discount
                            });
                            cb();
                        }
                    },
                    fail:function(res){
                        wx.showModal({
                            title: '出错了',
                            content: res.data.error.message,
                            showCancel: false
                        });
                    }, 
                    complete: function () {
                        if(that.obj.caling === 2){
                            that.obj.caling = 0;
                        }
                        wx.hideLoading();
                    }
                });
            }
        });
    }
});