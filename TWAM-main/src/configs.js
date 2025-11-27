{/* As seguintes funções são para gravar e obter o
username e a chave api no locaStorage do browser*/}

export function getName() {
    return localStorage.getItem('name');
}

export function setName(name) {
    localStorage.setItem('name', name);
}

export function getApiKey() {
    return localStorage.getItem('API_KEY');
}

export function setApiKey(key) {
    localStorage.setItem('API_KEY', key);
}

