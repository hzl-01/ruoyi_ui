import request from '@/utils/request'

// 查询区域列表
export function listAreas(query) {
  return request({
    url: '/jq/areas/list',
    method: 'get',
    params: query
  })
}

// 查询区域详细
export function getAreas(areaId) {
  return request({
    url: '/jq/areas/' + areaId,
    method: 'get'
  })
}

// 新增区域
export function addAreas(data) {
  return request({
    url: '/jq/areas',
    method: 'post',
    data: data
  })
}

// 修改区域
export function updateAreas(data) {
  return request({
    url: '/jq/areas',
    method: 'put',
    data: data
  })
}

// 删除区域
export function delAreas(areaId) {
  return request({
    url: '/jq/areas/' + areaId,
    method: 'delete'
  })
}
