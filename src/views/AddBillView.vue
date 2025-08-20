<template>
  <div class="add-bill-container">
    <!-- 新增账单按钮 -->
    <el-button class="floating-button" @click="showModal = true" :icon="Plus" size='large' circle />

    <!-- 弹窗 -->
    <el-dialog v-model="showModal" title="新增账单" width="400px" :append-to-body="true"
      :modal-style="{ overflow: 'hidden' }">
      <el-form :model="newBill" label-width="80px" @submit.prevent="submitBill">
        <el-form-item label="金额">
          <el-input-number v-model="newBill.amount" :precision="2" :step="0.01" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input v-model="newBill.description" />
        </el-form-item>

        <el-form-item label="日期">
          <el-date-picker v-model="newBill.date" type="datetime" placeholder="选择日期" value-format="x"
            :disabled-date="disabledDate" />
        </el-form-item>

        <div style="text-align: center;">
          <el-button @click="showModal = false">取消</el-button>
          <el-button type="primary" native-type="submit">提交</el-button>
        </div>
      </el-form>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ref } from 'vue';


// 控制模态框的显示
const showModal = ref(false);

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 新增账单的数据模型
const newBill = ref({
  amount: 0,
  description: '',
  date: ''
});

// 提交账单的方法
const submitBill = () => {
  console.log('提交的账单:', newBill.value);
  // 这里可以调用 API 或者触发父组件事件
  showModal.value = false;
};
</script>

<style scoped>
.el-button--large {
  --el-button-size: 60px;
}

.add-bill-container {
  /* 确保子元素的绝对定位是相对于此容器 */
  position: relative;
}

/* 浮动按钮样式 */
.floating-button {
  position: fixed;
  bottom: 100px;
  left: 50%;
  /* 水平居中 */
  transform: translateX(-50%);
  /* 精确对齐 */
  width: 60px;
  height: 60px;
  border-radius: 100%;
  background: linear-gradient(135deg, #6200EE, #7C43E1);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(98, 0, 238, 0.3);
  font-size: 22px;
  z-index: 99;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.floating-button:hover {
  background-color: #369d6b;
}

/* 模态框覆盖层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 模态框内容 */
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 表单样式 */
.modal-content form {
  display: flex;
  flex-direction: column;
}

.modal-content label {
  margin-top: 10px;
  font-weight: bold;
}

.modal-content input {
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-content button {
  margin-top: 15px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-content button[type="submit"] {
  background-color: #42b983;
  color: white;
}

.modal-content button[type="submit"]:hover {
  background-color: #369d6b;
}

.modal-content button[type="button"] {
  background-color: #ccc;
  color: black;
  margin-left: 10px;
}

.modal-content button[type="button"]:hover {
  background-color: #aaa;
}
</style>
