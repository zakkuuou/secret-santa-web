let myName = "";
let targetFriend = "";

async function register() {
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim();
    
    if (!name) return alert("Введите имя!");

    try {
        const res = await fetch('/api/santa/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name })
        });
        
        if (!res.ok) throw new Error("Ошибка сервера");

        const data = await res.json();
        
        myName = data.userName;
        targetFriend = data.giftFor;

        document.getElementById('displayMe').innerText = myName;
        document.getElementById('step1').classList.add('hidden');
        document.getElementById('step2').classList.remove('hidden');

        const giftDisplay = document.getElementById('giftFor');
        giftDisplay.innerText = targetFriend || "Ждем других игроков...";
        
    } catch (err) {
        alert("Не удалось подключиться к серверу.");
    }
}

async function sendWish() {
    const wish = document.getElementById('myWish').value.trim();
    if (!wish) return alert("Напиши что-нибудь!");

    try {
        const res = await fetch('/api/santa/wish', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: myName, wish })
        });
        
        if (res.ok) {
            alert("Санта записал твое желание!");
        }
    } catch (err) {
        alert("Ошибка при сохранении пожелания.");
    }
}

async function checkFriendWish() {
    if (!targetFriend) return alert("Друг еще не назначен!");

    try {
        const res = await fetch(`/api/santa/wish/${encodeURIComponent(targetFriend)}`);
        const data = await res.json();
        
        const display = document.getElementById('friendWishDisplay');
        display.innerText = `✨ ${targetFriend} мечтает о: ${data.wish}`;
    } catch (err) {
        alert("Не удалось получить желание друга.");
    }
}