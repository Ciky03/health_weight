Page({
  data: {
    avatar: '/utils/images/default.png',
    name: '卡路里杀手',
    sex: '',
    age: '',
    weight: '',
    height: '',
    weekTarget: '',
    activityLevel: '',
    activityLevelIndex: 0,
    activityLevels: ['久坐不动', '轻度活动', '中度活动', '重度活动', '极度活动'],
    calorieTarget: '',
    suggestedCalorie: ''
  },

  // 添加性别转换方法
  convertSex(sexCode) {
    console.log('转换性别，输入值:', sexCode);
    const result = sexCode == 0 ? '女' : sexCode == 1 ? '男' : '';
    console.log('转换后的性别:', result);
    return result;
  },

  // 年龄输入验证（只能输入正整数）
  onAgeInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*$/.test(value) || Number(value) < 0) {
      return this.data.age;
    }
    return value;
  },

  // 体重输入验证（只能输入正数，可以有小数）
  onWeightInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*\.?\d*$/.test(value) || Number(value) < 0) {
      return this.data.weight;
    }
    return value;
  },

  // 身高输入验证（只能输入正数，可以有小数）
  onHeightInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*\.?\d*$/.test(value) || Number(value) < 0) {
      return this.data.height;
    }
    return value;
  },

  // 增减目标输入验证（可以输入正负数，可以有小数）
  onWeekTargetInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字（可以是负数），保持原值不变
    if (!/^-?\d*\.?\d*$/.test(value)) {
      return this.data.weekTarget;
    }
    return value;
  },

  // 卡路里目标输入验证（只能输入正数，可以有小数）
  onCalorieTargetInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*\.?\d*$/.test(value) || Number(value) < 0) {
      return this.data.calorieTarget;
    }
    return value;
  },

  // 活动程度选择改变事件
  onActivityLevelChange(e) {
    const index = e.detail.value;
    this.setData({
      activityLevelIndex: index,
      activityLevel: this.data.activityLevels[index]
    });
  },

  onAvatarTap() {
    console.log('头像被点击了');
    const that = this;
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success(userRes) {
        console.log('获取用户信息成功:', userRes);
        const { encryptedData, iv, rawData, signature } = userRes;
        wx.login({
          success(res) {
            console.log('wx.login 成功:', res);
            if (res.code) {
              wx.request({
                url: 'http://127.0.0.1:8080/user/login',
                header:{
                  "Content-Type": "application/json"
                },
                method: 'POST',
                data: {
                  code: res.code,
                  encryptedData,
                  iv,
                  signature
                },
                success(resp) {
                  console.log('请求后端成功，返回数据:', resp.data);
                  console.log('后端返回的data字段:', resp.data.data);
                  if (resp.data.data && resp.data.data.token) {
                    // 修正token的存储
                    wx.setStorageSync('token', resp.data.data.token);
                    console.log('后端返回的性别值:', resp.data.data.sex);
                    const newData = {
                      avatar: resp.data.data.avatar || that.data.avatar,
                      name: resp.data.data.name || that.data.name,
                      sex: that.convertSex(resp.data.data.sex)
                    };
                    console.log('准备设置的新数据:', newData);
                    that.setData(newData, () => {
                      console.log('数据设置完成，当前数据:', that.data);
                    });
                  } else {
                    console.error('后端返回数据格式不正确:', resp.data);
                  }
                },
                fail(err) {
                  console.error('请求后端失败:', err);
                }
              });
            }
          },
          fail(err) {
            console.error('wx.login 失败:', err);
          }
        });
      },
      fail(err) {
        console.error('获取用户信息失败:', err);
      }
    });
  }
}); 