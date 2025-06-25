// logs.js
const util = require('../../utils/util.js')
const config = require('../../config')
const app = getApp()

Page({
  data: {
    years: [],
    months: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    yearIndex: 0,
    monthIndex: 0,
    selectedYear: 2021,
    selectedMonth: 8,
    viewType: 'month',
    selectedDate: null,
    expandedSlot: '',
    monthSummary: [],
    dailyCalorieDetail: {},
    periodCalories: {
      morning: 0,
      noon: 0,
      afternoon: 0,
      evening: 0
    }
  },

  // 获取日历数据
  fetchCalendarData() {
    const token = app.common.getTokenFromStorageSync();
    if (!token) {
      // 即使没有token也要显示日历
      this.generateDays();
      return;
    }

    wx.showLoading({
      title: '加载中...'
    });

    wx.request({
      url: `${config.baseUrl}/calorie/calendar/list`,
      method: 'GET',
      header: {
        'token': token
      },
      data: {
        date: this.data.selectedDate
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const { monthSummary, dailyCalorieDetail } = res.data.data;
          
          this.setData({
            monthSummary: monthSummary || [],
            dailyCalorieDetail: dailyCalorieDetail || {}
          });
        } else {
          // 请求成功但数据异常时，清空数据
          this.setData({
            monthSummary: [],
            dailyCalorieDetail: {}
          });
          
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取日历数据失败:', err);
        // 请求失败时，清空数据
        this.setData({
          monthSummary: [],
          dailyCalorieDetail: {}
        });
        
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      },
      complete: () => {
        // 无论成功失败，都要生成日历和计算时段卡路里
        this.generateDays();
        this.calculatePeriodCalories();
        wx.hideLoading();
      }
    });
  },

  // 计算各时段卡路里
  calculatePeriodCalories() {
    const periodCalories = {
      morning: 0,
      noon: 0,
      afternoon: 0,
      evening: 0
    };

    if (this.data.dailyCalorieDetail && this.data.dailyCalorieDetail.todayDetails) {
      const details = this.data.dailyCalorieDetail.todayDetails;
      for (let i = 0; i < details.length; i++) {
        const item = details[i];
        if (item.intakePeriod === 0) {
          periodCalories.morning += item.calories;
        } else if (item.intakePeriod === 1) {
          periodCalories.noon += item.calories;
        } else if (item.intakePeriod === 2) {
          periodCalories.afternoon += item.calories;
        } else if (item.intakePeriod === 3) {
          periodCalories.evening += item.calories;
        }
      }
    }

    this.setData({
      periodCalories
    });
  },

  onLoad() {
    if (!app.common.checkLogin()) {
      // 即使未登录也要显示日历
      this.generateDays();
      return;
    }
   
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i.toString())
    }
    
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${util.formatNumber(today.getMonth() + 1)}-${util.formatNumber(today.getDate())}`
    
    this.setData({
      years,
      selectedYear: today.getFullYear(),
      selectedMonth: today.getMonth() + 1,
      yearIndex: years.indexOf(today.getFullYear().toString()),
      monthIndex: today.getMonth(),
      selectedDate: todayStr
    }, () => {
      this.fetchCalendarData();
    });
  },

  // 添加onShow生命周期函数
  onShow() {
    // 获取当前页面实例
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    // 如果页面有lastTotalCalorie属性，且与全局变量不同，说明数据有更新
    if (typeof currentPage.lastTotalCalorie === 'undefined' || 
        currentPage.lastTotalCalorie !== app.globalData.totalCalorie) {
      // 更新lastTotalCalorie
      currentPage.lastTotalCalorie = app.globalData.totalCalorie;
      // 重新获取日历数据
      this.fetchCalendarData();
    }
  },

  // 生成日历天数
  generateDays() {
    const { selectedYear, selectedMonth, selectedDate, monthSummary } = this.data
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
      const dateStr = `${selectedYear}-${util.formatNumber(selectedMonth)}-${util.formatNumber(i)}`
      let dayCalories = null;

      // 查找当天的卡路里数据
      if (monthSummary && monthSummary.length > 0) {
        for (let j = 0; j < monthSummary.length; j++) {
          if (monthSummary[j].intakeDate === dateStr) {
            dayCalories = monthSummary[j].totalCalories;
            break;
          }
        }
      }
      
      days.push({
        day: i,
        current: true,
        today: isCurrentMonth && i === today.getDate(),
        selected: dateStr === selectedDate,
        calories: dayCalories
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
    const selectedYear = parseInt(this.data.years[yearIndex])
    const firstDayOfMonth = `${selectedYear}-${util.formatNumber(this.data.selectedMonth)}-01`
    
    this.setData({
      yearIndex,
      selectedYear,
      selectedDate: firstDayOfMonth
    }, () => {
      this.fetchCalendarData()
    })
  },

  // 月份改变
  onMonthChange(e) {
    const monthIndex = e.detail.value
    const selectedMonth = parseInt(this.data.months[monthIndex])
    const firstDayOfMonth = `${this.data.selectedYear}-${util.formatNumber(selectedMonth)}-01`
    
    this.setData({
      monthIndex,
      selectedMonth,
      selectedDate: firstDayOfMonth
    }, () => {
      this.fetchCalendarData()
    })
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
    
    const dateStr = `${this.data.selectedYear}-${util.formatNumber(this.data.selectedMonth)}-${util.formatNumber(date.day)}`
    
    this.setData({
      selectedDate: dateStr
    }, () => {
      this.fetchCalendarData()
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
