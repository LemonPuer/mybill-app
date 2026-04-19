<template>
  <div class="categories-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">分类管理</div>
      <el-button type="primary" @click="handleAdd">添加分类</el-button>
    </div>

    <!-- 分类列表 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="categoryList.length === 0" class="empty-state">
      <el-icon :size="48" class="empty-icon">
        <FolderOpened />
      </el-icon>
      <p class="empty-text">暂无分类，点击右下角添加</p>
    </div>

    <div v-else class="category-grid">
      <div v-for="item in categoryList" :key="item.id" class="category-card">
        <div class="category-icon">
          <el-icon>
            <component :is="item.icon || 'Folder'" />
          </el-icon>
        </div>
        <div class="category-name">{{ item.category }}</div>
        <div class="category-actions">
          <el-button :icon="Edit" circle size="small" @click="handleEdit(item)" />
          <el-button :icon="Delete" circle size="small" type="danger" @click="handleDelete(item)" />
        </div>
      </div>
    </div>

    <!-- 新增分类弹窗 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-position="top">
        <el-form-item label="分类名称" required>
          <el-input v-model="formData.category" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="选择图标" required>
          <div class="icon-scroll-container">
            <el-scrollbar>
              <el-radio-group v-model="formData.icon" class="icon-list">
                <el-radio-button
                  v-for="icon in iconOptions"
                  :key="icon.name"
                  :label="icon.name"
                  class="icon-item"
                >
                  <el-icon>
                    <component :is="icon.component" />
                  </el-icon>
                </el-radio-button>
              </el-radio-group>
            </el-scrollbar>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, FolderOpened, Edit, Delete } from '@element-plus/icons-vue'
import * as ElIcons from '@element-plus/icons-vue'
import * as billApi from '@/services/bill'
import { useCategoryStore } from '@/stores/useCategoryStore'
import type Category from '@/models/Category'

const router = useRouter()
const categoryStore = useCategoryStore()
const loading = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const editingId = ref(0)

const formData = ref({
  category: '',
  icon: '',
})

const iconOptions = Object.keys(ElIcons).map((key) => ({
  name: key,
  component: ElIcons[key as keyof typeof ElIcons],
}))

const categoryList = ref<Category[]>([])

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await billApi.getCategory({ pageNum: 1, pageSize: 100 })
    categoryList.value = res.data.data.result || []
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = { category: '', icon: '' }
  showDialog.value = true
}

const handleEdit = (item: Category) => {
  isEdit.value = true
  editingId.value = item.id || 0
  formData.value = { category: item.category, icon: item.icon }
  showDialog.value = true
}

const handleSubmit = async () => {
  if (!formData.value.category.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  if (!formData.value.icon) {
    ElMessage.warning('请选择图标')
    return
  }

  try {
    const payload = {
      category: formData.value.category,
      icon: formData.value.icon,
    }
    if (isEdit.value) {
      await billApi.saveCategory({ ...payload, id: editingId.value })
      ElMessage.success('修改成功')
    } else {
      await billApi.saveCategory(payload)
      ElMessage.success('添加成功')
    }
    showDialog.value = false
    fetchCategories()
    categoryStore.fetchCategories()
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (item: Category) => {
  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await billApi.deleteCategory(item.id!)
    ElMessage.success('删除成功')
    fetchCategories()
    categoryStore.fetchCategories()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  fetchCategories()
})

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.categories-view {
  padding-bottom: 80px;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--color-accent);
  color: #fff;
}

.back-btn .el-icon {
  font-size: 18px;
  color: var(--color-text-primary);
}

.back-btn:hover .el-icon {
  color: #fff;
}

.page-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}

.category-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(20, 184, 166, 0.1);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.category-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.category-actions {
  display: flex;
  gap: 8px;
}

.category-actions .el-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--glass-bg-raised);
  border: none;
  color: var(--color-text-secondary);
}

.category-actions .el-button:hover {
  background: var(--color-accent);
  color: #fff;
}

.icon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-scroll-container {
  height: 200px;
  overflow: hidden;
}

.icon-item {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 10px;
}

.icon-item .el-icon {
  font-size: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.loading-state {
  padding: 20px;
}
</style>
