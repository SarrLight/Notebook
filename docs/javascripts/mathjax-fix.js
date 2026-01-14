document.addEventListener('DOMContentLoaded', function() {
  const contentArea = document.querySelector('.arithmatex');
  if (!contentArea) return;

  if (contentArea.hasAttribute('data-mathjax-fixed')) return;

  let fixedContent = contentArea.innerHTML;
  // 移除$$前后的双引号
  fixedContent = fixedContent
    .replace(/"(\$\$)/g, '$1')
    .replace(/(\$\$)"/g, '$1');
  
  // 清理冗余br并重组为<br>$$<br>公式<br>$$<br>
  fixedContent = fixedContent.replace(
    /(<br\s*\/?>)*\s*(\$\$)\s*(<br\s*\/?>)*([\s\S]*?)(<br\s*\/?>)*\s*(\$\$)\s*(<br\s*\/?>)*/g,
    '<br>$2<br>$4<br>$6<br>'
  );

  if (fixedContent !== contentArea.innerHTML) {
    contentArea.innerHTML = fixedContent;
    // 重新渲染MathJax
    window.MathJax?.typesetClear();
    window.MathJax?.typesetPromise([contentArea]).catch(err => 
      console.error('MathJax渲染失败:', err)
    );
  }
});