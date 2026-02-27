// 兼容 MkDocs Material Instant Loading (navigation.instant)
// 在页面切换（Pjax/RxJS navigation）后重新加载不蒜子统计脚本

document$.subscribe(function() {
    var script = document.createElement("script");
    script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    script.async = true;

    // 移除旧的脚本以防止重复加载（如果有的话）
    // 注意：不蒜子脚本没有 ID，我们通过 src 查找
    var oldScript = document.querySelector('script[src*="busuanzi"]');
    if (oldScript) {
        oldScript.remove();
    }
    
    // 如果不蒜子已经运行过，它可能会修改 DOM。
    // 在 Instant Loading 中，DOM body 内容已被替换，所以我们需要重新运行脚本来再次查找并绑定新的 DOM 元素。
    // 将新脚本添加到 body
    document.body.appendChild(script);
});
