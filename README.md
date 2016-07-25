# Webpack
----------------
### 一个完整的前端工作流，内容目录为：
前端工程目录结构
gulp clean
gulp copy
gulp less
gulp autoprefixer
gulp webpack
gulp eslint
gulp watch
gulp connect 和 livereload
gulp mock server
gulp test

### 基于这些目标定义如下工程结构：
.
├── package.json                 
├── README.md                    
├── gulpfile.js                  // gulp 配置文件
├── webpack.config.js            // webpack 配置文件
├── doc                          // doc  目录：放置应用文档
├── test                         // test 目录：测试文件
├── dist                         // dist 目录：放置开发时候的临时打包文件
├── bin                          // bin  目录：放置 prodcution 打包文件
├── mocks                        // 数据 mock 相关  
├── src                          // 源文件目录
│   ├── html                     // html 目录 
│   │   ├── index.html
│   │   └── page2.html
│   ├── js                       // js 目录 
│   │   ├── common               // 所有页面的共享区域，可能包含共享组件，共享工具类
│   │   ├── home                 // home 页面 js 目录
│   │   │   ├── components
│   │   │   │   ├── App.js
│   │   │   ├── index.js         // 每个页面会有一个入口，统一为 index.js
│   │   ├── page2                // page2 页面 js 目录
│   │   │   ├── components
│   │   │   │   ├── App.js
│   │   │   └── index.js
│   └── style                    // style 目录
│       ├── common               // 公共样式区域
│       │   ├── varables.less    // 公共共享变量
│       │   ├── index.less       // 公共样式入口
│       ├── home                 // home 页面样式目录    
│       │   ├── components       // home 页面组件样式目录
│       │   │   ├── App.less 
│       │   ├── index.less       // home 页面样式入口
│       ├── page2                // page2 页面样式目录
│       │   ├── components       
│       │   │   ├── App.less
│       │   └── index.less       
├── vendor
│   └── bootstrap
└── └── jquery
### 安装基础依赖
#### react 相关
```plain
npm install react react-dom --save
```
#### webpack 相关
```plain
npm install webpack-dev-server webpack --save-dev
npm install babel-loader babel-preset-es2015 babel-preset-stage-0 babel-preset-react babel-polyfill --save-dev
```
注：练习时package.json里面name不能是webpack（坑死我了这地方）
#### gulp 相关
```plain
npm install gulpjs/gulp-cli -g
npm install gulpjs/gulp.git#4.0 --save-dev
npm install gulp-util del gulp-rename gulp-autoprefixer gulp-remember gulp-cached gulp-less gulp-connect connect-rest@1.9.5  --save-dev
```
#### 功能
清理和拷贝任务 
样式转换 
自动刷新和数据 mock
代码监控
#### 结束
注：webpack.config.js中config.entry = Object.assign({}, config.entry, newEntries)可能会报错 
可以安装npm install --save object-assign模块
并调用它Object.assign = require('object-assign')