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

/**
 * 防抖处理 - 防止快速连续点击
 * @param fn - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 */
const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 1000,
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 解析文本并打开账单确认弹窗
 * 添加了防抖处理，防止重复提交
 */
const handleSubmit = debounce(async (): Promise<void> => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入账单内容')
    return
  }

  // 防止重复提交
  if (loading.value) return

  loading.value = true
  try {
    const res = await billApi.parseBillText(inputText.value)
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
  } catch (error: unknown) {
    console.error('解析失败:', error)
    // 显示具体错误原因
    const errorMsg = getErrorMessage(error, '解析失败，请手动添加')
    ElMessage.warning(errorMsg)
    // 打开空白表单让用户手动填写
    addBillRef.value?.open()
  } finally {
    loading.value = false
  }
}, 1500) // 1.5秒内不能重复点击

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'msg' in error.response.data &&
    typeof error.response.data.msg === 'string'
  ) {
    return error.response.data.msg
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
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
  background: var(--glass-bg-raised);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
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
  font-weight: 600;
  border-radius: var(--radius-button);
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-strong));
  border: none;
  color: #fff;
  cursor: pointer;
  transition: transform var(--motion-fast), box-shadow var(--motion-fast);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-button);
}
</style>
