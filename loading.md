# loading

## 通过加载状态事件制作进度条

+ documen.onreadystatechanch (页面加载状态改变时候的事件)
+ document.reasyState (返回当文档的状态)

```javascript
    document.onreadystatechanch = function(){
        if(document.readyState == 'complete'){
            // 页面加载成功逻辑
        }
    }
```

最后
-----------------
绝大多数的loading效果都是通过readyState去判断是否加载完毕

paceJs是最棒的loading组件！！！