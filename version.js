// Переменная с версией — меняешь только тут, и она обновляется везде
const currentVersion = "v0.1 Pre Alpha"; 

// Ждем, пока загрузится HTML-структура страницы
document.addEventListener("DOMContentLoaded", () => {
    const versionTarget = document.getElementById("app-version");
    
    // Проверяем, есть ли этот id на текущей странице, чтобы JS не выдавал ошибку
    if (versionTarget) {
        versionTarget.textContent = currentVersion;
    }
});