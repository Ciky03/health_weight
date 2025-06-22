// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    years: [],
    months: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    days: [],
    yearIndex: 0,
    monthIndex: 0,
    selectedYear: 2021,
    selectedMonth: 8,
    viewType: 'month',
    selectedDate: null, // 存储选中的日期（带圆圈的）
    expandedSlot: '' // 当前展开的时间段
  },

  onLoad() {
   
    // 初始化年份列表（前后5年）
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i.toString())
    }
    
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    
    this.setData({
      years,
      selectedYear: today.getFullYear(),
      selectedMonth: today.getMonth() + 1,
      yearIndex: years.indexOf(today.getFullYear().toString()),
      monthIndex: today.getMonth(),
      selectedDate: todayStr // 初始化今天的日期为选中（圆圈）
    })

    this.generateDays()
     // 检查登录状态
     if (!app.common.checkLogin()) return;
  },

  // 生成日历天数
  generateDays() {
    const { selectedYear, selectedMonth, selectedDate } = this.data
    const days = []
    
    // 获取当月第一天是星期几
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay() || 7
    
    // 获取当月天数
    const monthDays = new Date(selectedYear, selectedMonth, 0).getDate()
    
    // 获取上月天数
    const prevMonthDays = new Date(selectedYear, selectedMonth - 1, 0).getDate()
    
    // 填充上月剩余天数
    for (let i = firstDay - 1; i > 0; i--) {
      days.push({
        day: prevMonthDays - i + 1,
        current: false
      })
    }
    
    // 填充当月天数
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth - 1
    
    for (let i = 1; i <= monthDays; i++) {
      const dateStr = `${selectedYear}-${selectedMonth}-${i}`
      days.push({
        day: i,
        current: true,
        today: isCurrentMonth && i === today.getDate(),
        selected: dateStr === selectedDate
      })
    }
    
    // 填充下月开始天数
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        current: false
      })
    }
    
    this.setData({ days })
  },

  // 年份改变
  onYearChange(e) {
    const yearIndex = e.detail.value
    this.setData({
      yearIndex,
      selectedYear: parseInt(this.data.years[yearIndex])
    })
    this.generateDays()
  },

  // 月份改变
  onMonthChange(e) {
    const monthIndex = e.detail.value
    this.setData({
      monthIndex,
      selectedMonth: parseInt(this.data.months[monthIndex])
    })
    this.generateDays()
  },

  // 切换视图类型
  switchViewType(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ viewType: type })
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date
    if (!date.current) return
    
    const dateStr = `${this.data.selectedYear}-${this.data.selectedMonth}-${date.day}`
    
    this.setData({
      selectedDate: dateStr // 更新选中的日期（圆圈）
    }, () => {
      this.generateDays()
    })
  },

  // 切换时间段展开状态
  toggleTimeSlot(e) {
    const time = e.currentTarget.dataset.time
    this.setData({
      expandedSlot: this.data.expandedSlot === time ? '' : time
    })
  }
})
