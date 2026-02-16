<template>
  <div class="home-view">
    <div class="input-container">
      <textarea
        v-model="inputText"
        class="smart-input"
        placeholder="输入转账记录，如：今天吃饭花了50元"
        @keydown.enter.ctrl="handleSubmit"
      ></textarea>
      <el-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">
        解析
      </el-button>
    </div>

    <!-- 复用 AddBillView 组件 -->
    <AddBillView ref="addBillRef" title="确认账单信息" :show-type="true" :show-category="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as billApi from '@/services/bill'
import AddBillView from '@/views/AddBillView.vue'

const inputText = ref<string>('')
const loading = ref<boolean>(false)
const addBillRef = ref<InstanceType<typeof AddBillView>>()

const handleSubmit = async (): Promise<void> => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入账单内容')
    return
  }

  loading.value = true
  try {
    const res = await billApi.parseBillText({ message: inputText.value })
    const parsed = res?.data?.data || {}

    // 调用 AddBillView 打开弹窗，并传入初始数据
    addBillRef.value?.open({
      type: parsed.type ?? 2,
      amount: parsed.amount ?? 0,
      categoryId: parsed.categoryId ?? 0,
      transactionDate: parsed.transactionDate ?? '',
      note: parsed.note ?? '',
    })

    // 清空输入框
    inputText.value = ''
  } catch (error) {
    console.error('解析失败:', error)
    ElMessage.error('解析失败，请手动添加')
    // 打开空白表单让用户手动填写
    addBillRef.value?.open()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 104px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}

.input-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-card);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.smart-input {
  width: 100%;
  min-height: 240px;
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-primary);
  resize: none;
  outline: none;
}

.smart-input::placeholder {
  color: var(--color-text-disabled);
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  height: 52px;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--radius-button);
}
</style>
