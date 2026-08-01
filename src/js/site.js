(function(){
  var drawer = document.getElementById('drawer');
  var burger = document.getElementById('burger');
  var panel  = drawer.querySelector('.panel');

  function isOpen(){ return drawer.hasAttribute('data-open'); }

  function closeDrawer(refocus){
    if(!isOpen()) return;
    drawer.removeAttribute('data-open');
    burger.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
    if(refocus) burger.focus();
  }
  function openDrawer(){
    drawer.setAttribute('data-open','');
    burger.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
    var first = panel.querySelector('a, button');
    if(first) first.focus();
  }
  burger.addEventListener('click', openDrawer);
  document.getElementById('drawerclose').addEventListener('click', function(){ closeDrawer(true); });
  drawer.addEventListener('click', function(e){ if(e.target === drawer) closeDrawer(true); });

  document.addEventListener('keydown', function(e){
    if(!isOpen()) return;
    if(e.key === 'Escape'){ closeDrawer(true); return; }
    if(e.key !== 'Tab') return;
    // 드로어가 열려 있는 동안 포커스가 뒤 화면으로 새어 나가지 않게 가둔다
    var f = panel.querySelectorAll('a[href], button');
    if(!f.length) return;
    var first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-demo]');
    if(t){ e.preventDefault(); alert('준비 중인 기능입니다. 전화로 문의해 주세요. 063-542-2737'); }
  });

  // 하단 고정 전화바: 스크롤 내리는 동안 숨기고, 올리면 다시 보인다.
  // - 8px 미만의 미세한 움직임은 무시 (손떨림·관성 미세 진동)
  // - iOS 고무줄 스크롤은 y를 [0, 최대]로 잘라내 깜빡임을 막는다
  var callbar = document.querySelector('.callbar');
  if(callbar){
    var lastY = window.pageYOffset, ticking = false;
    window.addEventListener('scroll', function(){
      if(ticking) return;
      ticking = true;
      window.requestAnimationFrame(function(){
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var y = Math.min(Math.max(window.pageYOffset, 0), Math.max(max, 0));
        var d = y - lastY;
        if(Math.abs(d) > 8){
          if(d > 0 && y > 80) callbar.setAttribute('data-hidden','');
          else callbar.removeAttribute('data-hidden');
          lastY = y;
        }
        ticking = false;
      });
    }, {passive:true});
  }
})();
