import request from '@/utils/request'

// 查询城市增删改查列表
export function listCities(query) {
  return request({
    url: '/jq/cities/list',
    method: 'get',
    params: query
  })
}

// 查询城市增删改查详细
export function getCities(cityId) {
  return request({
    url: '/jq/cities/' + cityId,
    method: 'get'
  })
}

// 新增城市增删改查
export function addCities(data) {
  return request({
    url: '/jq/cities',
    method: 'post',
    data: data
  })
}

// 修改城市增删改查
export function updateCities(data) {
  return request({
    url: '/jq/cities',
    method: 'put',
    data: data
  })
}

// 删除城市增删改查
export function delCities(cityId) {
  return request({
    url: '/jq/cities/' + cityId,
    method: 'delete'
  })
}
