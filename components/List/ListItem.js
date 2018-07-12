// components/List/ListItem.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    arrow:{
      type:String, // 默认不显箭头
      value:'empty'
    },
    bottomline:{ // 默认显示下边框
      type:Boolean,
      value:true
    },
    hidden:{ // 默认不隐藏
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
