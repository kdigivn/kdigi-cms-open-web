(function () {
  // Mermaid chỉ được tải khi trang thực sự có sơ đồ: gói min.js nặng 3,5 MB, mà
  // chỉ ~87% trang nội dung có sơ đồ — các trang còn lại (trang chủ, trang danh
  // mục, 404, trang chỉ có bảng) trước đây vẫn phải tải và phân tích cả gói.
  var MERMAID_KEYWORDS = /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|block|quadrantChart|requirementDiagram|sankey|xychart|C4Context|architecture)\b/;

  /**
   * Thay mỗi <pre> chứa cú pháp mermaid bằng <div class="mermaid"> và trả về danh sách.
   * Nhận biết theo NỘI DUNG, không theo `data-language`: Expressive Code chỉ gắn
   * `data-language` khi khối được đánh dấu ```mermaid, trong khi cách nhận biết theo
   * từ khoá đầu tiên bao được cả trường hợp khối dùng nhãn khác.
   */
  function collect() {
    var blocks = [];
    document.querySelectorAll('pre').forEach(function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;

      // Expressive Code bọc MỖI dòng trong <div class="ec-line">; các div này
      // không sinh newline nên code.textContent gộp cả sơ đồ thành một dòng và
      // mermaid báo "Syntax error in text". Phải ghép lại theo từng .ec-line.
      var ecLines = pre.querySelectorAll('.ec-line');
      var text = ecLines.length
        ? Array.prototype.map.call(ecLines, function (line) { return line.textContent; }).join('\n').trim()
        : (code.textContent || '').trim();

      if (!MERMAID_KEYWORDS.test(text)) return;

      var div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = text;
      var wrapper = pre.closest('figure') || pre.parentElement;
      wrapper.replaceWith(div);
      blocks.push(div);
    });
    return blocks;
  }

  function initialize(blocks) {
    var dark = document.documentElement.dataset.theme === 'dark';
    // useMaxWidth=false: sơ đồ giữ cỡ chữ thật; sơ đồ rộng cuộn ngang trong khung
    // (.mermaid trong content.css) thay vì bị co lại tới mức không đọc được.
    var natural = { useMaxWidth: false };
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      // Màu theo token Tech Blue (src/styles/tokens.css).
      themeVariables: dark
        ? { fontSize: '15px', darkMode: true, background: '#0C1730', primaryColor: '#16295A', primaryTextColor: '#EAF0FC', primaryBorderColor: '#6C9CFF', lineColor: '#A3B3D1', secondaryColor: '#13213F', tertiaryColor: '#0F1C3B', noteBkgColor: '#33260C', noteTextColor: '#FCD34D' }
        : { fontSize: '15px', background: '#FFFFFF', primaryColor: '#E3ECFF', primaryTextColor: '#0A1A3A', primaryBorderColor: '#1B55E0', lineColor: '#46587A', secondaryColor: '#EAF0FA', tertiaryColor: '#F3F7FD', noteBkgColor: '#FEF3C7', noteTextColor: '#7A4700' },
      flowchart: natural,
      sequence: natural,
      state: natural,
      er: natural,
      class: natural,
    });

    mermaid
      .run({ nodes: blocks })
      .then(function () { blocks.forEach(enhance); })
      .catch(function (e) {
        console.error('Mermaid render error:', e);
      });
  }

  function render() {
    var blocks = collect();
    if (!blocks.length) return;

    // Thẻ script thêm động chạy như `async`, nên phải nối tiếp qua `onload` để
    // chắc chắn mermaid.min.js xong trước khi gọi `initialize`.
    var script = document.createElement('script');
    script.src = '/mermaid.min.js';
    script.onload = function () { initialize(blocks); };
    script.onerror = function () { console.error('Không tải được /mermaid.min.js'); };
    document.head.appendChild(script);
  }

  // Sơ đồ rộng hơn khung tối đa 1,6 lần thì co cho vừa (chữ vẫn đọc được);
  // rộng hơn nữa thì giữ cỡ thật và cuộn ngang, vì co lại sẽ không đọc nổi.
  // Mọi sơ đồ có nút phóng to để xem trọn vẹn trên toàn màn hình.
  function enhance(div) {
    var svg = div.querySelector('svg');
    if (!svg) return;
    var natural = parseFloat(svg.getAttribute('width')) || svg.getBoundingClientRect().width;
    var available = div.clientWidth - 32;
    if (natural > available && natural <= available * 1.6) {
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
    }

    var english = (document.documentElement.lang || '').indexOf('en') === 0;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'hd-diagram-zoom';
    button.textContent = english ? 'Enlarge' : 'Phóng to';
    button.addEventListener('click', function () { openOverlay(svg, english); });
    div.appendChild(button);
  }

  function openOverlay(svg, english) {
    var overlay = document.createElement('div');
    overlay.className = 'hd-diagram-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', english ? 'Enlarged diagram' : 'Sơ đồ phóng to');

    var panel = document.createElement('div');
    panel.className = 'hd-diagram-overlay-panel';
    var clone = svg.cloneNode(true);
    clone.removeAttribute('style');
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    panel.appendChild(clone);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'hd-diagram-overlay-close';
    close.textContent = english ? 'Close (Esc)' : 'Đóng (Esc)';

    function dismiss() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(event) {
      if (event.key === 'Escape') dismiss();
    }
    close.addEventListener('click', dismiss);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) dismiss();
    });
    document.addEventListener('keydown', onKey);

    overlay.appendChild(close);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    close.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
