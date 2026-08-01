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
})();
