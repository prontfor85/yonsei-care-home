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

  // 홈에서는 히어로의 전화 CTA가 보이는 동안 하단 고정 바를 내려 둔다.
  // 히어로가 없는 나머지 페이지에서는 마크업에 data-hidden 이 없어 처음부터 떠 있다.
  var callbar = document.querySelector('.callbar');
  var heroCta = document.querySelector('.herogrid .btns');
  if(callbar && heroCta && 'IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      for(var i=0;i<entries.length;i++){
        if(entries[i].isIntersecting) callbar.setAttribute('data-hidden','');
        else callbar.removeAttribute('data-hidden');
      }
    }, {threshold:0}).observe(heroCta);
  } else if(callbar){
    callbar.removeAttribute('data-hidden');
  }

  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-demo]');
    if(t){ e.preventDefault(); alert('준비 중인 기능입니다. 전화로 문의해 주세요. 063-542-2737'); }
  });

  var tb = document.getElementById('themebtn');
  function currentTheme(){
    return document.documentElement.getAttribute('data-theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function syncThemeLabel(){
    tb.textContent = currentTheme() === 'dark' ? '밝게 보기' : '어둡게 보기';
  }
  tb.addEventListener('click', function(){
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try{ localStorage.setItem('ysc-theme', next); }catch(e){}
    syncThemeLabel();
  });
  syncThemeLabel();
})();
