const moment = require('moment')

const createElement = require('./CreateElement');

class MergeRequestList {
    createList(items) {
        console.log(items);
        const orderedList = createElement('ol');

        items.forEach(({approvalsInfo, author, web_url, title, created_at, projectInfo}) => {
            const {
                approved_by, suggested_approvers, approvals_left, approvals_required, user_can_approve, user_has_approved
            } = approvalsInfo;

            const {
                name
            } = projectInfo;

            const approvedBy = approved_by.map(({user}) => user.name).join(' and ');
            const suggested = suggested_approvers.map(({name}) => name).join(', ');

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <details>
                    <summary>
                        <a href="${web_url}" target="_blank" class="button" aria-label="Go to this merge in the external browser">GO</a>
                        <span>
                            ${title} by <span class="author-name">${author.name}</span> at <time>${moment(created_at).format('DD-MM-YYYY HH:mm')}</time> (created <time datetime="${created_at}">${(moment(created_at).fromNow())}</time>)
                        </span>      
                    </summary>
                    <p>Project: ${name}</p>
                    <p>Aprrovals: ${approvals_required - approvals_left} / ${approvals_required}</p>
                    ${approvedBy ? `<p>Approved by: ${approvedBy}</p>` : ''}
                    ${suggested ? `<p>Suggested approvers: ${suggested}</p>` : ''}
                </details>
            `;
            user_can_approve ? listItem.classList.add('user-can-approve') : listItem.classList.add('user-cant-approve');
            user_has_approved ? listItem.classList.add('user-has-approved') : '';

            orderedList.appendChild(listItem);
        });
        this.open
    }

    redirectToExternalBrowser() {
        document.addEventListener('click', e => {
            if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
                e.preventDefault();
                shell.openExternal(e.target.href);
            }
        });
    }
}

module.exports = MergeRequestList;