# 轻量Nginx镜像，运行HTML/JS/CSS
FROM nginx:alpine
# 把本地代码复制到Nginx网页目录
COPY . /usr/share/nginx/html
# 暴露80端口（容器内部端口）
EXPOSE 80
# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]