<template>
  <div class="add-bill-container">
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
              v-for="cat in categoryStore.categoryList"
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
        <el-button @click="visible = false" :disabled="submitting">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          :disabled="submitting"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import * as billApi from '@/services/bill'
import { useCategoryStore } from '@/stores/useCategoryStore'

const categoryStore = useCategoryStore()

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

const props = withDefaults(defineProps<Props>(), {
  title: '新增账单',
  showType: false,
  showCategory: false,
})

const emit = defineEmits<{
  success: []
}>()

// 是否显示分类（用于校验）
const showCategory = computed(() => props.showCategory)

const visible = ref(false)
const submitting = ref(false)

const defaultData = {
  id: undefined as number | undefined,
  type: 2, // 默认支出
  amount: 0,
  categoryId: undefined as number | undefined,
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
  // 每次打开都重新获取分类
  categoryStore.fetchCategories()
  visible.value = true
}

const handleSubmit = async () => {
  // 金额校验
  if (!formData.amount || formData.amount <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }

  // 分类校验（如果showCategory为true）
  if (showCategory.value && !formData.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }

  // 防止重复提交
  if (submitting.value) return
  submitting.value = true

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
      categoryId: formData.categoryId ?? 0,
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
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error?.response?.data?.msg || '保存失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open,
})
</script>

<style scoped>
:deep(.el-dialog) {
  background: var(--glass-bg-raised) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-modal);
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: -1px 0 0 0 var(--color-accent);
  color: #fff;
}

:deep(.el-input-number .el-input__wrapper) {
  background: var(--color-bg-input);
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  border-color: var(--color-border);
}
</style>
