# 分类管理页面实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现设置页面的分类管理功能，用户可以在独立页面中管理收支分类

**Architecture:** 新增分类管理路由和页面组件，复用现有图标选择功能，使用主题系统保持样式一致

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Pinia

---

## Task 1: 新增删除分类 API

**Files:**

- Modify: `src/services/bill.ts`

**Step 1: 添加删除分类接口**

在 `src/services/bill.ts` 末尾添加:

```typescript
/**
 * 删除分类
 * @param id 分类ID
 * @returns
 */
export const deleteCategory = (id: number) => {
  return api.post('/app/deleteCategory', {
    data: { id },
  })
}
```

**Step 2: 验证类型检查**

Run: `npm run type-check`

---

## Task 2: 创建分类管理页面组件

**Files:**

- Create: `src/views/settings/CategoriesView.vue`

**Step 1: 创建页面组件**

```vue
<template>
  <div class="categories-view">
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
          <el-scrollbar>
            <el-radio-group v-model="formData.icon" class="icon-list">
              <el-radio-button
                v-for="icon in iconOptions"
                :key="icon.name"
                :value="icon.name"
                class="icon-item"
              >
                <el-icon>
                  <component :is="icon.component" />
                </el-icon>
              </el-radio-button>
            </el-radio-group>
          </el-scrollbar>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 新增按钮 -->
    <el-button class="floating-button" :icon="Plus" circle size="large" @click="handleAdd" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderOpened, Plus, Edit, Delete } from '@element-plus/icons-vue'
import * as ElIcons from '@element-plus/icons-vue'
import * as billApi from '@/services/bill'
import { useCategoryStore } from '@/stores/useCategoryStore'
import type Category from '@/models/Category'

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
</script>

<style scoped>
.categories-view {
  padding-bottom: 80px;
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
  background: var(--color-bg-card);
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
  color: var(--color-primary);
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
  background: var(--color-bg-input);
  border: none;
}

.category-actions .el-button:hover {
  background: var(--color-primary);
  color: #fff;
}

.icon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  box-shadow: 0 4px 20px rgba(20, 184, 166, 0.4);
  z-index: 99;
}

.loading-state {
  padding: 20px;
}
</style>
```

**Step 2: 验证类型检查**

Run: `npm run type-check`

---

## Task 3: 添加路由配置

**Files:**

- Modify: `src/router/index.ts`

**Step 1: 添加路由**

在 children 数组中添加:

```typescript
{
  path: '/settings/categories',
  name: 'settings-categories',
  component: () => import('@/views/settings/CategoriesView.vue'),
}
```

**Step 2: 验证**

Run: `npm run type-check`

---

## Task 4: 更新设置页面跳转

**Files:**

- Modify: `src/views/SettingsView.vue`

**Step 1: 更新跳转方法**

将 `goToPage` 方法改为实际跳转:

```typescript
const goToPage = (path: string) => {
  router.push(path)
}
```

**Step 2: 验证**

Run: `npm run type-check`

---

## Task 5: 测试完整流程

**Step 1: 启动开发服务器**

Run: `npm run dev`

**Step 2: 验证功能**

1. 进入设置页面，点击"分类管理"
2. 跳转到 /settings/categories
3. 新增分类
4. 编辑分类
5. 删除分类

**Step 3: 运行检查**

Run: `npm run type-check && npm run lint`

---

## 总结

实现完成，需要修改的文件:

1. `src/services/bill.ts` - 添加删除API
2. `src/views/settings/CategoriesView.vue` - 新建页面
3. `src/router/index.ts` - 添加路由
4. `src/views/SettingsView.vue` - 修复跳转
