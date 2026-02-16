<template>
  <div class="add-bill-container">
    <!-- 新增账单按钮 -->
    <el-button class="floating-button" @click="open" :icon="Plus" size="large" circle />

    <!-- 弹窗 -->
    <el-dialog
      v-model="visible"
      :title="title"
      width="400px"
      :append-to-body="true"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="类型" v-if="showType">
          <el-radio-group v-model="formData.type">
            <el-radio-button :value="1">收入</el-radio-button>
            <el-radio-button :value="2">支出</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="金额">
          <el-input-number v-model="formData.amount" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="分类" v-if="showCategory">
          <el-select v-model="formData.categoryId" placeholder="选择分类" style="width: 100%">
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
            v-model="formData.transactionDate"
            type="datetime"
            placeholder="选择日期"
            value-format="x"
            :disabled-date="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="formData.note" placeholder="可选备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as billApi from '@/services/bill'
import type Category from '@/models/Category'

interface Props {
  title?: string
  showType?: boolean
  showCategory?: boolean
  initialData?: {
    id?: number
    type?: number
    amount?: number
    categoryId?: number
    accountId?: number
    transactionDate?: string | number
    note?: string
  }
}

withDefaults(defineProps<Props>(), {
  title: '新增账单',
  showType: false,
  showCategory: false,
})

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const categoryList = ref<Category[]>([])

const defaultData = {
  id: undefined as number | undefined,
  type: 0,
  amount: 0,
  categoryId: 0,
  accountId: 0,
  transactionDate: '',
  note: '',
}

const formData = reactive({ ...defaultData })

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const open = (initialData?: Props['initialData']) => {
  if (initialData) {
    Object.assign(formData, { ...defaultData, ...initialData })
  } else {
    Object.assign(formData, defaultData)
  }
  visible.value = true
}

const handleSubmit = async () => {
  if (formData.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }

  try {
    const payload: {
      id?: number
      type: number
      amount: number
      categoryId: number
      accountId: number
      transactionDate: string
      note: string
    } = {
      type: formData.type,
      amount: formData.amount,
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      transactionDate: String(formData.transactionDate),
      note: formData.note,
    }
    if (formData.id) {
      payload.id = formData.id
    }
    await billApi.saveFinanceTransactions(payload)
    ElMessage.success(formData.id ? '修改成功' : '添加成功')
    visible.value = false
    emit('success')
  } catch {
    ElMessage.error('保存失败')
  }
}

const fetchCategories = async () => {
  try {
    const res = await billApi.getCategory({ pageNum: 1, pageSize: 100 })
    categoryList.value = res.data.data.result || []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

onMounted(() => {
  fetchCategories()
})

defineExpose({
  open,
})
</script>

<style scoped>
/* 悬浮按钮 */
.floating-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(20, 184, 166, 0.4);
  transition: all 0.3s ease;
  z-index: 99;
}

.floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(20, 184, 166, 0.5);
}
</style>
