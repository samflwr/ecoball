let header = document.getElementById('header')

let nube1 = document.getElementById('nube1')
let transparente = document.getElementById('transparente')
let nube2 = document.getElementById('nube2')
let slogan = document.getElementById('slogan')
let subslogan = document.getElementById('subslogan')
let btn = document.getElementById('btn')
let viento = document.getElementById('viento')



window.addEventListener('scroll', function(){
    let value = window.scrollY;
    
    transparente.style.marginTop =  value * 0.3 + 'px';
    nube1.style.left = value* -5  + 'px';
    nube2.style.left = value* -5  + 'px';
    btn.style.marginTop = value * 0.7 + 'px';
    slogan.style.marginTop = value*1.3  + 'px';
    slogan.style.opacity =   100+value* -0.07  + '%';
    subslogan.style.marginBottom =   value* -1.6  + 'px';
    subslogan.style.opacity =   100+value* -0.9  + '%';
    subslogan.style.letterSpacing = value * 0.3 + 'px';
    btn.style.opacity =   0 + '%';
    viento.style.left = value* -5  + 'px';
    header.style.marginTop = value * 0.4 + 'px';
})

const navigation = document.querySelector('nav')
document.querySelector('.menu').onclick = function (){
    this.classList.toggle('active');
    navigation.classList.toggle('active');
}
