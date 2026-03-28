let myName = "";
let targetFriend = "";

async function register() {
    const name = document.getElementById('userName').value.trim();
    if (!name) return alert("Введите имя!");

    const res = await fetch('/api/santa/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name })
    });
    
    const data = await res.json();
    myName = data.userName;
    targetFriend = data.giftFor;

    document.getElementById('displayMe').innerText = myName;
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');

    document.getElementById('giftFor').innerText = targetFriend || "Ждем других игроков...";
}

async function sendWish() {
    const wish = document.getElementById('myWish').value.trim();
    if (!wish) return alert("Напиши желание!");

    await fetch('/api/santa/wish', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: myName, wish })
    });
    alert("Сохранено!");
}

async function checkFriendWish() {
    if (!targetFriend) return alert("Подопечный еще не назначен!");
    
    const res = await fetch(`/api/santa/wish/${encodeURIComponent(targetFriend)}`);
    const data = await res.json();
    
    document.getElementById('friendWishDisplay').innerText = 
        `${targetFriend} хочет: ${data.wish}`;
}