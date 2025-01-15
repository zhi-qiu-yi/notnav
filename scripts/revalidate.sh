#!/bin/bash

# 获取环境变量
source .env

# 触发重新验证
curl -X GET "http://localhost:10212/api/revalidate?token=$REVALIDATE_TOKEN" 