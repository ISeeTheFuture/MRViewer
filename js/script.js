const Store = require('electron-store');
const MergeRequests = require('./MergeRequests')


const store = new Store();


class Login {
    constructor() {
        const storedToken = store.get('token')
        storedToken ? new MergeRequests(storedToken) : this.getValue();
    }

    getValue() {
        const tokenInput = document.getElementById('token');
        const submitBtn = document.getElementById('submit');

        submitBtn.addEventListener('click', e => {
            e.preventDefault();
            new MergeRequests(tokenInput.value);
        })
    }
}

new Login();