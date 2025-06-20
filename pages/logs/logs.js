// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },

  onLoad() {
    this.loadLogs()
  },

  loadLogs() {
    const logs = wx.getStorageSync('logs') || []
    this.setData({
      logs: logs.map(log => {
        const date = new Date(log)
        return {
          date: util.formatDate(date),
          time: util.formatTime(date),
          timeStamp: log
        }
      })
    })
  },

  clearLogs() {
    wx.showModal({
      title: '提示',
      content: '确定要清除所有日志记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('logs')
          this.setData({
            logs: []
          })
          wx.showToast({
            title: '日志已清除',
            icon: 'success'
          })
        }
      }
    })
  }
})
