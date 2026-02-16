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

    <!-- 确认弹窗 -->
    <el-dialog
      v-model="showConfirm"
      title="确认账单信息"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="billForm" label-width="80px">
        <el-form-item label="类型">
          <el-radio-group v-model="billForm.type">
            <el-radio-button :value="1">收入</el-radio-button>
            <el-radio-button :value="2">支出</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="billForm.amount" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="billForm.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="cat in categoryList"
              :key="cat.id"
              :label="cat.category"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="billForm.transactionDate"
            type="datetime"
            placeholder="选择日期"
            value-format="x"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="billForm.note" placeholder="可选备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfirm = false">取消</el-button>
        <el-button type="primary" @click="confirmBill">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as billApi from '@/services/bill'

const inputText = ref('')
const loading = ref(false)
const showConfirm = ref(false)
const categoryList = ref<any[]>([])

const billForm = reactive({
  type: 2 as number,
  amount: 0,
  categoryId: 0,
  transactionDate: '',
  note: '',
})

const handleSubmit = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入账单内容')
    return
  }

  loading.value = true
  try {
    const res = await billApi.parseBillText({ text: inputText.value })
    const parsed = res.data.data

    billForm.type = parsed.type || 2
    billForm.amount = parsed.amount || 0
    billForm.categoryId = parsed.categoryId || 0
    billForm.transactionDate = parsed.date || new Date().getTime().toString()
    billForm.note = parsed.note || ''

    showConfirm.value = true
  } catch {
    ElMessage.error('解析失败，请手动输入')
  } finally {
    loading.value = false
  }
}

const confirmBill = async () => {
  try {
    await billApi.saveFinanceTransactions(billForm)
    ElMessage.success('添加成功')
    showConfirm.value = false
    inputText.value = ''
  } catch {
    ElMessage.error('保存失败')
  }
}

onMounted(async () => {
  try {
    const res = await billApi.getCategory({ pageNum: 1, pageSize: 100 })
    categoryList.value = res.data.data.result || []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
})
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
