window.MathJax = {
  loader: {load: ['[tex]/gensymb']},
  tex: {
    packages: {'[+]': ['gensymb']},
    inlineMath: [['$', '$'], ['\\(', '\\)']], // 行内公式识别规则
    displayMath: [['$$', '$$'], ['\\[', '\\]']], // 块级公式
    processEscapes: true, // 允许转义字符，避免Markdown干扰
    processEscapes: true,
    processEnvironments: true
  },
  svg: {
      fontCache: 'global' // 优化字体加载
  }
  ,
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

document$.subscribe(() => { 
  MathJax.startup.output.clearCache()
  MathJax.typesetClear()
  MathJax.texReset()
  MathJax.typesetPromise()
})