<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="区域名称" prop="areaName">
        <el-input
          v-model="queryParams.areaName"
          placeholder="请输入区域名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['jq:areas:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['jq:areas:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['jq:areas:remove']"
        >删除</el-button>
      </el-col>
      
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="areasList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="区域ID" align="center" prop="areaId" />
      <el-table-column label="区域名称" align="center" prop="areaName" />
      <el-table-column label="城市信息" align="center" prop="cities" width="300">
        <template slot-scope="scope">
          <div v-if="scope.row.cities && scope.row.cities.length">
            <div v-for="(city, index) in scope.row.cities" :key="index" class="city-info">
              <div class="city-name">{{ city.cityName }}</div>
              <div class="address-list">
                <el-tag
                  v-for="(address, addrIndex) in city.addresses"
                  :key="addrIndex"
                  size="mini"
                  type="info"
                  class="address-tag"
                >
                  {{ address }}
                </el-tag>
              </div>
            </div>
          </div>
          <span v-else>暂无城市信息</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updatedAt, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['jq:areas:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['jq:areas:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改区域对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="区域名称" prop="areaName">
          <el-input v-model="form.areaName" placeholder="请输入区域名称" />
        </el-form-item>
        
        <!-- 城市和地址模块 -->
        <el-form-item label="城市管理">
          <div class="city-module">
            <div class="city-item" v-for="(city, index) in form.cities" :key="index">
              <div class="city-header">
                <span>城市 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  plain
                  @click="removeCity(index)"
                  v-if="form.cities.length > 1"
                >删除</el-button>
              </div>
              
              <el-form-item
                :prop="`cities.${index}.cityId`"
                :rules="{ required: true, message: '请选择城市', trigger: 'change' }"
                label="选择城市"
                label-width="80px"
              >
                <el-select 
                  v-model="city.cityId" 
                  placeholder="请选择城市"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in citiesOptions"
                    :key="item.cityId"
                    :label="item.cityName"
                    :value="item.cityId"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="地址列表" label-width="80px">
                <div class="address-list">
                  <div class="address-item" v-for="(address, addrIndex) in city.addresses" :key="addrIndex">
                    <el-input
                      v-model="city.addresses[addrIndex]"
                      placeholder="请输入地址"
                      style="width: 80%; margin-right: 10px;"
                    />
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="removeAddress(index, addrIndex)"
                      v-if="city.addresses.length > 1"
                    ></el-button>
                  </div>
                  <el-button
                    type="primary"
                    icon="el-icon-plus"
                    size="mini"
                    @click="addAddress(index)"
                    style="margin-top: 10px;"
                  >添加地址</el-button>
                </div>
              </el-form-item>
            </div>
            
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="addCity"
              style="margin-top: 15px;"
            >添加城市</el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAreas, getAreas, delAreas, addAreas, updateAreas } from "@/api/jq/areas"
import { listCities } from "@/api/jq/cities"

export default {
  name: "Areas",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 区域表格数据
      areasList: [],
      // 城市选项
      citiesOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        areaName: null
      },
      // 表单参数
      form: {
        areaId: null,
        areaName: null,
        cities: [
          {
            cityId: null,
            addresses: [""]
          }
        ]
      },
      // 表单校验
      rules: {
        areaName: [
          { required: true, message: "区域名称不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getCitiesList()
  },
  methods: {
    /** 查询区域列表 */
    getList() {
      this.loading = true
      listAreas(this.queryParams).then(response => {
        this.areasList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 获取城市列表 */
    getCitiesList() {
      listCities({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.citiesOptions = response.rows
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        areaId: null,
        areaName: null,
        cities: [
          {
            cityId: null,
            addresses: [""]
          }
        ]
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.areaId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加区域"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const areaId = row.areaId || this.ids
      getAreas(areaId).then(response => {
        this.form = response.data
        // 确保cities数组存在且不为空
        if (!this.form.cities || this.form.cities.length === 0) {
          this.form.cities = [{
            cityId: null,
            addresses: [""]
          }]
        }
        this.open = true
        this.title = "修改区域"
      })
    },
    // 添加城市
    addCity() {
      this.form.cities.push({
        cityId: null,
        addresses: [""]
      })
    },
    // 删除城市
    removeCity(index) {
      this.form.cities.splice(index, 1)
    },
    // 添加地址
    addAddress(cityIndex) {
      this.form.cities[cityIndex].addresses.push("")
    },
    // 删除地址
    removeAddress(cityIndex, addrIndex) {
      this.form.cities[cityIndex].addresses.splice(addrIndex, 1)
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 验证每个城市是否已选择
          let citiesValid = true
          for (let i = 0; i < this.form.cities.length; i++) {
            if (!this.form.cities[i].cityId) {
              this.$message.error(`请选择第${i + 1}个城市`)
              citiesValid = false
              break
            }
            
            // 验证每个地址是否为空
            for (let j = 0; j < this.form.cities[i].addresses.length; j++) {
              if (!this.form.cities[i].addresses[j]) {
                this.$message.error(`第${i + 1}个城市的第${j + 1}个地址不能为空`)
                citiesValid = false
                break
              }
            }
            if (!citiesValid) break
          }
          
          if (!citiesValid) return
          
          if (this.form.areaId != null) {
            updateAreas(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addAreas(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const areaIds = row.areaId || this.ids
      this.$modal.confirm('是否确认删除区域编号为"' + areaIds + '"的数据项？').then(function() {
        return delAreas(areaIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('jq/areas/export', {
        ...this.queryParams
      }, `areas_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.city-module {
  border: 1px solid #e6ebf5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.city-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #e6ebf5;
}

.city-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.city-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: bold;
  color: #409EFF;
}

.address-list {
  margin-left: 20px;
}

.address-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/* 城市信息样式 */
.city-info {
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.city-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #409EFF;
}

.address-tag {
  margin: 2px;
}
</style>